import { ConfigManager } from '../data/config-manager';
import { UserService } from '../user/user.service';
import { Client, ChatUserstate } from 'tmi.js';
import { Utils } from '../util/utils';
import * as ircConfig from './irc.service.json';

/**
 * Provides a connection to the Twitch IRC chat servers via two-way
 * communication with the target account.
 */
export class IrcService {
  private connection: Client;
  private callbacks: Array<(message: string) => void> = [];

  public IsConnected: boolean;

  constructor(public configManager: ConfigManager, public userService: UserService) { }

  private onWhisper(from: string, userstate: ChatUserstate, message: string, self: boolean): void {
    if (!self) {
      for (const fn of this.callbacks) {
        fn(message);
      }
    }
  }

  private reconnect(reason: string): void {
    this.IsConnected = false;
    this.Connect();
  }

  /**
   * Registers a function to be called every time the client receives a whisper.
   * @param callback A function to be called when a message is received.
   */
  public Register(callback: (message: string) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Removes the reference to a registered callback function.
   * @param callback A previously-registered callback function.
   */
  public Unregister(callback: (message: string) => void): void {
    const index = this.callbacks.indexOf(callback);
    this.callbacks.splice(index, 1);
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
      this.connection.on('whisper', this.onWhisper);
      this.connection.on('disconnected', this.reconnect);
      const response = await Utils.PromiseWithReject(this.connection.connect());
      return response.Success;
    }
  }
}
