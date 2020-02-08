import { Injectable } from '@angular/core';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { Utils } from 'src/app/util/utils';
import { ChatUserstate, Client } from 'tmi.js';
import { UserService } from '../user/user.service';
import * as ircConfig from './irc.service.json';
import { RollingTimer } from './rolling-timer';

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
  private static connection: Client;
  private static callbacks = new Map<string, WhisperCallback>();
  private static history = '';
  private static lines = new Array<string>();
  private static messageQueue = new Array<string>();
  private static secondTimer = new RollingTimer(1, 3);
  private static minuteTimer = new RollingTimer(60, 100);
  public static IsConnected = false;

  private static processQueue(): void {
    if (this.IsConnected && this.messageQueue.length > 0) {
      const limit = Math.min(this.messageQueue.length,
        this.secondTimer.availableOccurrences(),
        this.minuteTimer.availableOccurrences());
      if (limit > 0) {
        const toSend = this.messageQueue.splice(0, limit);
        for (const message of toSend) {
          IrcService.connection.whisper(ircConfig.botAccount, message);
          this.secondTimer.addOccurrence();
          this.minuteTimer.addOccurrence();
        }
      }
    }
    setTimeout(() => { IrcService.processQueue(); }, 100);
  }

  public get IsConnected(): boolean { return IrcService.IsConnected; }

  constructor(public configManager: ConfigManager, public userService: UserService) { }

  private onWhisper(from: string, userstate: ChatUserstate, message: string, self: boolean): void {
    const prefixedMessage = self ? `>> ${message}` : message;
    IrcService.lines.push(prefixedMessage);
    IrcService.history += `${self ? '\n' : ''}${message}\n`;
    for (const [key, value] of IrcService.callbacks) {
      value.call(value, prefixedMessage);
    }
  }

  private reconnect(reason: string): void {
    IrcService.IsConnected = false;
    this.Connect();
  }

  /**
   * Registers a function to be called every time the client receives a whisper.
   * @param id The id of the callback function.
   * @param callback A function to be called when a message is received.
   * @param overwrite If true, will replace any previous references with the same id.
   * @returns The client history if requested, otherwise undefined.
   */
  public Register(id: string, callback: WhisperCallback, overwrite: boolean = false): void {
    if (!IrcService.callbacks.has(id) || overwrite) {
      IrcService.callbacks.set(id, callback);
    }
  }

  /**
   * Returns the history of messages the connection has received up to this point.
   */
  public GetHistory(): string {
    return IrcService.history;
  }

  public GetLines(): Array<string> {
    return [...IrcService.lines];
  }

  /**
   * Returns a list of messages queued to send.
   */
  public GetQueuedMessages(): Array<string> {
    return [...IrcService.messageQueue];
  }

  /**
   * Removes the reference to a registered callback function.
   * @param id The id of the callback function.
   */
  public Unregister(id: string): void {
    if (IrcService.callbacks.has(id)) {
      IrcService.callbacks.delete(id);
    }
  }

  /**
   * Queues a message to send as a whisper to the bot account the app is
   * connected to. This is rate limited to avoid exceeding Twitch's whisper
   * limits, as per https://dev.twitch.tv/docs/irc/guide#command--message-limits
   * @param message The message to send
   */
  public Send(message: string): void {
    if (IrcService.messageQueue.indexOf(message) === -1) {
      IrcService.messageQueue.push(message);
    }
  }

  /**
   * Connects the client to twitch. This will only succeed if the config data
   * contains a valid token.
   */
  public async Connect(): Promise<boolean> {
    if (IrcService.IsConnected) {
      return true;
    } else {
      IrcService.processQueue();
      const token = this.configManager.GetConfig().Authentication.Token;
      const userData = await this.userService.GetUserInfo(token);
      const options = ircConfig.connectOptions;
      options.options.clientId = userData.client_id;
      options.identity.username = userData.login;
      options.identity.password = `oauth:${token}`;
      IrcService.connection = Client(options);
      IrcService.connection.on('whisper', (from, userstate, message, self) => {
        this.onWhisper(from, userstate, message, self);
      });
      IrcService.connection.on('disconnected', (reason) => { this.reconnect(reason); });
      const response = await Utils.PromiseWithReject(IrcService.connection.connect());
      IrcService.IsConnected = response.Success;
      return response.Success;
    }
  }
}
