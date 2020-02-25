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
export type WhisperCallback = ((message: string) => void);

/**
 * Provides a connection to the Twitch IRC chat servers via two-way
 * communication with the target account.
 */
@Injectable({
  providedIn: 'root',
})
export class IrcService {
  private static connection: Client | null = null;
  private static callbacks = new Map<string, WhisperCallback>();
  private static errorHandlers = new Map<string, WhisperCallback>();
  private static history = '';
  private static lines: string[] = [];
  private static messageQueue = new MessageQueue(ircConfig.botAccount, 100);
  static isConnected = false;

  /**
   * Resets the static properties of the IrcService to their default state.
   */
  static reset(): void {
    IrcService.connection = null;
    IrcService.callbacks.clear();
    IrcService.errorHandlers.clear();
    IrcService.history = '';
    IrcService.lines.length = 0;
    IrcService.messageQueue.reset();
    IrcService.isConnected = false;
  }

  /**
   * The tmi.js client that handles the IRC connection.
   */
  get connection(): Client | null { return IrcService.connection; }

  /**
   * A map of all registered callback functions to receive whisper events.
   */
  get callbacks(): Map<string, WhisperCallback> { return new Map<string, WhisperCallback>(IrcService.callbacks.entries()); }

  /**
   * A map of all registered callback functions to receive error events.
   */
  get errorHandlers(): Map<string, WhisperCallback> { return new Map<string, WhisperCallback>(IrcService.errorHandlers.entries()); }

  /**
   * The entire history of received messages as a single string.
   */
  get history(): string { return IrcService.history; }

  /**
   * An array containing a record of every message received.
   */
  get lines(): string[] { return [...IrcService.lines]; }

  /**
   * The message queue that handles rate limits on messages sent.
   */
  get messageQueue(): MessageQueue { return IrcService.messageQueue; }

  /**
   * Whether or not the IRC client is connected.
   */
  get isConnected(): boolean { return IrcService.isConnected; }

  constructor(public configManager: ConfigManager, public userService: UserService) { }

  private onWhisper(message: string, self = false): void {
    const prefixedMessage = self ? `>> ${message}` : message;
    IrcService.lines.push(prefixedMessage);
    IrcService.history += `${self ? '\n' : ''}${message}\n`;
    for (const [key, value] of IrcService.callbacks) {
      value.call(value, prefixedMessage);
    }
  }

  private onError(message: string): void {
    for (const [key, value] of IrcService.errorHandlers) {
      value.call(value, message);
    }
  }

  private reconnect(reason: string): void {
    IrcService.isConnected = false;
    this.connect();
  }

  /**
   * Registers a function to be called every time the client receives a whisper.
   * @param id The id of the callback function.
   * @param callback A function to be called when a message is received.
   * @param overwrite If true, will replace any previous references with the same id.
   */
  register(id: string, callback: WhisperCallback, overwrite = false): void {
    if (!IrcService.callbacks.has(id) || overwrite) {
      IrcService.callbacks.set(id, callback);
    }
  }

  /**
   * Removes the reference to a registered callback function.
   * @param id The id of the callback function.
   */
  unregister(id: string): void {
    if (IrcService.callbacks.has(id)) {
      IrcService.callbacks.delete(id);
    }
  }

  /**
   * Registers a function to be called when the client fails to send a whisper.
   * @param id The id of the callback function.
   * @param callback A function to be called when an error occurs while sending a message.
   * @param overwrite If true, will replace any previous references with the same id.
   */
  registerForError(id: string, callback: WhisperCallback, overwrite = false): void {
    if (!IrcService.errorHandlers.has(id) || overwrite) {
      IrcService.errorHandlers.set(id, callback);
    }
  }

  /**
   * Removes the reference to a registered callback function.
   * @param id The id of the callback function.
   */
  unregisterForError(id: string): void {
    if (IrcService.errorHandlers.has(id)) {
      IrcService.errorHandlers.delete(id);
    }
  }

  /**
   * Returns the history of messages the connection has received up to this point.
   */
  getHistory(): string {
    return IrcService.history;
  }

  /**
   * Returns each message the connection has received in an array.
   */
  getLines(): string[] {
    return [...IrcService.lines];
  }

  /**
   * Queues a message to send as a whisper to the bot account the app is
   * connected to. This is rate limited to avoid exceeding Twitch's whisper
   * limits, as per https://dev.twitch.tv/docs/irc/guide#command--message-limits
   * @param message The message to send
   */
  send(message: string): void {
    IrcService.messageQueue.send(message);
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
    if (IrcService.isConnected) {
      return true;
    } else {
      const token = this.configManager.GetConfig().Authentication.Token;
      if (!token) {
        return false;
      }
      const userData = await this.userService.getUserInfo(token);
      const options = ircConfig.connectOptions;
      options.options.clientId = userData.client_id;
      options.identity.username = userData.login;
      options.identity.password = `oauth:${token}`;
      IrcService.connection = client.call(client, options) as Client;
      IrcService.messageQueue.setSendFunction(IrcService.connection.whisper);
      IrcService.messageQueue.start();
      IrcService.connection.on('raw_message', (message) => {
        const tag = message.tags['msg-id'] ? message.tags['msg-id'] : undefined;
        if (message.command === 'NOTICE' && tag === 'whisper_restricted') {
          this.onError(message.params[1]);
        }
      });
      IrcService.connection.on('message', (channel, userstate, message, self) => {
        // console.log(`${userstate.username}: ${message}`);
      });
      IrcService.connection.on('whisper', (from, userstate, message, self) => {
        this.onWhisper(message, self);
      });
      IrcService.connection.on('disconnected', (reason) => { this.reconnect(reason); });
      const response = await Utils.promiseWithReject(IrcService.connection.connect());
      IrcService.isConnected = response.success;
      return response.success;
    }
  }
}
