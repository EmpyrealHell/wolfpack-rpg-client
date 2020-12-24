import { Injectable } from '@angular/core';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { Utils } from 'src/app/util/utils';
import { Client, Options } from 'tmi.js';
import { UserService } from '../user/user.service';
import * as ircConfig from './irc.service.json';
import { MessageQueue } from './message-queue';

/**
 * Callback type used for broadcasting whisper messages received by the client.
 */
export type WhisperCallback = (message: Message) => void;

/**
 * Provides a connection to the Twitch IRC chat servers via two-way
 * communication with the target account.
 */
@Injectable({
  providedIn: 'root',
})
export class IrcService {
  /**
   * The tmi.js client that handles the IRC connection.
   */
  connection: Client | undefined;
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
  messageQueue = new MessageQueue(ircConfig.botAccount, 100);
  /**
   * Whether or not the IRC client is connected.
   */
  isConnected = false;

  constructor(
    public configManager: ConfigManager,
    public userService: UserService
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
   * limits, as per https://dev.twitch.tv/docs/irc/guide#command--message-limits
   * @param message The message to send
   */
  send(message: string): void {
    this.messageQueue.send(message);
  }

  /**
   * Connects the client to twitch using the tmi.js library. This will only
   * succeed if the config data contains a valid token.
   */
  async connect(): Promise<boolean> {
    return this.connectUsing(Client);
  }

  /**
   * Connects the client to twitch using the specified client constructor. This
   * will only succeed if the config data contains a valid token.
   */
  async connectUsing(client: (opts: Options) => Client): Promise<boolean> {
    if (this.isConnected) {
      return true;
    } else {
      const token = this.configManager.getConfig().authentication.token;
      if (!token) {
        return false;
      }
      const userData = await this.userService.getUserInfo(token);
      const options = ircConfig.connectOptions;
      options.options.clientId = userData.client_id;
      options.identity.username = userData.login;
      options.identity.password = `oauth:${token}`;
      this.connection = client.call(client, options) as Client;
      if (!this.connection) {
        return false;
      }
      this.messageQueue.setSendFunction((username, message) => {
        if (this.connection) {
          return this.connection.whisper(username, message);
        } else {
          return new Promise(result => ['', '']);
        }
      });
      this.messageQueue.setCheckFn(() => {
        return this.isConnected;
      });
      this.messageQueue.start();
      this.connection.on('raw_message', message => {
        const tag = message.tags['msg-id'] ? message.tags['msg-id'] : undefined;
        if (message.command === 'NOTICE' && tag === 'whisper_restricted') {
          this.onError(message.params[1]);
        }
      });
      this.connection.on('message', (channel, userstate, message, self) => {
        if (
          channel === `#${ircConfig.streamerAccount}` &&
          userstate.username === ircConfig.botAccount &&
          userstate['message-type'] === 'chat'
        ) {
          this.onMessage(message);
        }
      });
      this.connection.on('whisper', (from, userstate, message, self) => {
        this.onWhisper(message, self);
      });
      this.connection.on('disconnected', reason => {
        this.reconnect(reason);
      });
      const response = await Utils.promiseWithReject(this.connection.connect());
      this.isConnected = response.success;
      return response.success;
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
