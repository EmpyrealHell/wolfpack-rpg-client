import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Utils } from 'src/app/util/utils';
import { ConfigManager } from '../data/config-manager';
import { UserService } from '../user/user.service';
import { MessageQueue } from './message-queue';
import { WhisperService } from './whisper.service';
import * as eventSubConfig from './eventsub.service.json';

/**
 * Callback type used for broadcasting whisper messages received by the client.
 */
export type WhisperCallback = (message: Message) => void;

/**
 * Provides a connection to the Twitch EventSub chat servers via two-way
 * communication with the target account.
 */
@Injectable({
  providedIn: 'root',
})
export class EventSubService {
  private static EVENTSUB_URL =
    'https://api.twitch.tv/helix/eventsub/subscriptions';
  private static WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

  /**
   * The WebSocket connection that handles the EventSub connection.
   */
  connection: WebSocket | null = null;
  /**
   * The unique session identifier assigned by Twitch's EventSub service.
   * This ID is required for subscribing to events and maintaining the WebSocket connection.
   */
  private sessionId: string | null = null;
  /**
   * A map of all registered callback functions to receive whisper events.
   */
  callbacks = new Map<string, WhisperCallback>();
  /**
   * A map of all registered callback functions to receive error events.
   */
  errorHandlers = new Map<string, WhisperCallback>();
  /**
   * An array containing a record of every message received.
   */
  lines: Message[] = [];
  /**
   * The message queue that handles rate limits on messages sent.
   */
  messageQueue = new MessageQueue(eventSubConfig.botAccount, 50);
  /**
   * Whether or not the EventSub client is connected.
   */
  isConnected = false;

  constructor(
    private http: HttpClient,
    private configManager: ConfigManager,
    private userService: UserService,
    private whisperService: WhisperService
  ) {}

  private broadcastMessage(message: Message): void {
    this.lines.push(message);
    for (const [key, value] of this.callbacks) {
      value.call(value, message);
    }
  }

  private onMessage(message: string): void {
    this.broadcastMessage(new Message(message, false, false));
  }

  private onWhisper(message: string, self = false): void {
    this.broadcastMessage(new Message(message, self));
  }

  private onError(message: string): void {
    const messageObj = new Message(message, false);
    for (const [key, value] of this.errorHandlers) {
      value.call(value, messageObj);
    }
  }

  private reconnect(reason: string): void {
    this.isConnected = false;
    this.connect();
  }

  /**
   * Registers a function to be called every time the client receives a whisper.
   * @param id The id of the callback function.
   * @param callback A function to be called when a message is received.
   * @param overwrite If true, will replace any previous references with the same id.
   */
  register(id: string, callback: WhisperCallback, overwrite = false): void {
    if (!this.callbacks.has(id) || overwrite) {
      this.callbacks.set(id, callback);
    }
  }

  /**
   * Removes the reference to a registered callback function.
   * @param id The id of the callback function.
   */
  unregister(id: string): void {
    if (this.callbacks.has(id)) {
      this.callbacks.delete(id);
    }
  }

  /**
   * Registers a function to be called when the client fails to send a whisper.
   * @param id The id of the callback function.
   * @param callback A function to be called when an error occurs while sending a message.
   * @param overwrite If true, will replace any previous references with the same id.
   */
  registerForError(
    id: string,
    callback: WhisperCallback,
    overwrite = false
  ): void {
    if (!this.errorHandlers.has(id) || overwrite) {
      this.errorHandlers.set(id, callback);
    }
  }

  /**
   * Removes the reference to a registered callback function.
   * @param id The id of the callback function.
   */
  unregisterForError(id: string): void {
    if (this.errorHandlers.has(id)) {
      this.errorHandlers.delete(id);
    }
  }

  /**
   * Queues a message to send as a whisper to the bot account the app is
   * connected to. This is rate limited to avoid exceeding Twitch's whisper
   * limits, as per https://dev.twitch.tv/docs/chat/#command--message-limits
   * @param message The message to send
   */
  send(message: string): void {
    this.messageQueue.send(message);
  }

  /**
   * Connects the client to twitch using EventSub WebSocket. This will only
   * succeed if the config data contains a valid token.
   */
  async connect(): Promise<boolean> {
    return this.connectUsing(
      () => new WebSocket(EventSubService.WEBSOCKET_URL)
    );
  }

  /**
   * Connects the client to twitch using the specified WebSocket constructor. This
   * will only succeed if the config data contains a valid token.
   */
  async connectUsing(clientConstructor: () => WebSocket): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    const token = this.configManager.getConfig().authentication.token;
    if (!token) {
      console.log('Token not found!');
      return false;
    }

    const userData = await this.userService.getUserAuth(token);
    const botData = await this.userService.getUserId(
      token,
      eventSubConfig.connectOptions.options.clientId,
      eventSubConfig.botAccount
    );

    this.whisperService.setData(
      userData.user_id,
      botData.data[0].id,
      token,
      eventSubConfig.connectOptions.options.clientId,
      (error: string) => this.onError(error)
    );

    this.connection = clientConstructor();
    if (!this.connection) {
      return false;
    }

    this.messageQueue.setSendFunction(message => {
      if (this.whisperService) {
        return this.whisperService.sendWhisper(message);
      }
      return Promise.resolve();
    });

    this.messageQueue.setCheckFn(() => this.isConnected);
    this.messageQueue.registerSendCallback(
      'event-sub-client',
      (message: string) => this.onWhisper(message, true)
    );

    await this.messageQueue.start();

    const connectionResponse = await Utils.promiseWithReject<boolean, Event>(
      new Promise((resolve, reject) => {
        if (!this.connection) {
          reject(new Error('No connection'));
          return;
        }

        this.connection.onopen = () => {
          resolve(true);
        };

        this.connection.onmessage = async event => {
          const data = JSON.parse(event.data);

          if (data.metadata?.message_type === 'session_welcome') {
            this.sessionId = data.payload.session.id;
            this.isConnected = true;
            await this.subscribeToEventType(
              'user.whisper.message',
              userData.user_id
            );
          } else if (data.metadata?.message_type === 'notification') {
            if (data.metadata.subscription_type === 'channel.chat.message') {
              const chatEvent = data.payload.event;
              if (
                chatEvent.broadcaster_login ===
                  eventSubConfig.streamerAccount &&
                chatEvent.chatter_login === eventSubConfig.botAccount
              ) {
                this.onMessage(chatEvent.message.text);
              }
            } else if (
              data.metadata.subscription_type === 'user.whisper.message'
            ) {
              const whisperEvent = data.payload.event;
              const isSelf = whisperEvent.from_user_id === userData.user_id;
              if (!isSelf) {
                this.onWhisper(whisperEvent.whisper.text, isSelf);
              }
            }
          } else if (data.metadata?.message_type === 'session_reconnect') {
            this.reconnect('Session reconnect requested');
          }
        };

        this.connection.onclose = event => {
          this.isConnected = false;
          this.reconnect('WebSocket Closed');
        };

        this.connection.onerror = error => {
          console.error('EventSub: WebSocket Error:', error);
          this.onError('WebSocket Error');
          reject(error);
        };
      })
    );

    this.isConnected = connectionResponse.success;
    return connectionResponse.success;
  }

  private async subscribeToEventType(
    type: 'user.whisper.message',
    userId: string
  ): Promise<void> {
    const subscription = {
      type,
      version: '1',
      condition: {
        user_id: userId,
      },
      transport: {
        method: 'websocket',
        session_id: this.sessionId,
      },
    };

    const response = await this.http
      .post(EventSubService.EVENTSUB_URL, subscription, {
        headers: {
          'Client-Id': eventSubConfig.connectOptions.options.clientId,
          Authorization: `Bearer ${
            this.configManager.getConfig().authentication.token
          }`,
        },
      })
      .toPromise();

    if (!response) {
      this.onError(`Failed to subscribe to ${type}: No response`);
      return;
    }
  }
}

export class Message {
  timestamp = Date.now();
  constructor(
    public text: string,
    public self: boolean,
    public whisper = true
  ) {}
}
