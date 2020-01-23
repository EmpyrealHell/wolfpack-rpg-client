import { ConfigManager } from '../data/config-manager';
import { UserService } from '../user/user.service';
import { Client, ChatUserstate } from 'tmi.js';
import { Utils } from '../util/utils';
import * as ircConfig from './irc.service.json';
import { Injectable } from '@angular/core';

export type WhisperCallback = ((message: string) => void);

/**
 * Provides a connection to the Twitch IRC chat servers via two-way
 * communication with the target account.
 */
@Injectable({
  providedIn: 'root',
})
export class IrcService {
  private connection: Client;
  private callbacks: Map<string, WhisperCallback>;
  private history = '';

  public IsConnected = false;

  constructor(public configManager: ConfigManager, public userService: UserService) {
    this.callbacks = new Map<string, WhisperCallback>();
  }

  private onWhisper(from: string, userstate: ChatUserstate, message: string, self: boolean): void {
    if (!self) {
      this.history += message;
      for (const [key, value] of this.callbacks) {
        value.call(value, message);
      }
    } else {
      this.history += `\n >> ${message}\n\n`;
    }
  }

  private reconnect(reason: string): void {
    this.IsConnected = false;
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
    if (!this.callbacks.has(id) || overwrite) {
      this.callbacks.set(id, callback);
    }
  }

  /**
   * Returns the history of messages the connection has received up to this point.
   */
  public GetHistory(): string {
    return this.history;
  }

  /**
   * Removes the reference to a registered callback function.
   * @param id The id of the callback function.
   */
  public Unregister(id: string): void {
    if (this.callbacks.has(id)) {
      this.callbacks.delete(id);
    }
  }

  /**
   * Sends a whisper to the bot account the app is tied to.
   * @param message The message to send
   */
  public Send(message: string): void {
    this.connection.whisper(ircConfig.botAccount, message);
  }

  /**
   * Connects the client to twitch. This will only succeed if the config data
   * contains a valid token.
   */
  public async Connect(): Promise<boolean> {
    if (!this.IsConnected) {
      const token = this.configManager.GetConfig().Authentication.Token;
      const userData = await this.userService.GetUserInfo(token);
      const options = ircConfig.connectOptions;
      options.options.clientId = userData.client_id;
      options.identity.username = userData.login;
      options.identity.password = `oauth:${token}`;
      this.connection = Client(options);
      this.connection.on('whisper', (from, userstate, message, self) => {
        this.onWhisper(from, userstate, message, self);
      });
      this.connection.on('disconnected', (reason) => { this.reconnect(reason); });
      const response = await Utils.PromiseWithReject(this.connection.connect());
      this.IsConnected = response.Success;
      return response.Success;
    }
  }
}
