import { Injectable } from '@angular/core';
import { ChatUserstate, Client } from 'tmi.js';
import { ConfigManager } from '../data/config-manager';
import { UserService } from '../user/user.service';
import { Utils } from '../util/utils';
import * as ircConfig from './irc.service.json';

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
  private static callbacks: Map<string, WhisperCallback>;
  private static history = '';

  public static IsConnected = false;
  public get IsConnected(): boolean { return IrcService.IsConnected; }

  constructor(public configManager: ConfigManager, public userService: UserService) {
    IrcService.callbacks = new Map<string, WhisperCallback>();
  }

  private onWhisper(from: string, userstate: ChatUserstate, message: string, self: boolean): void {
    if (!self) {
      IrcService.history += message;
      for (const [key, value] of IrcService.callbacks) {
        value.call(value, message);
      }
    } else {
      IrcService.history += `\n >> ${message}\n\n`;
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
   * Sends a whisper to the bot account the app is tied to.
   * @param message The message to send
   */
  public Send(message: string): void {
    IrcService.connection.whisper(ircConfig.botAccount, message);
  }

  /**
   * Connects the client to twitch. This will only succeed if the config data
   * contains a valid token.
   */
  public async Connect(): Promise<boolean> {
    if (IrcService.IsConnected) {
      return true;
    } else {
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
