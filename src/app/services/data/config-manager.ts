import { Injectable } from '@angular/core';
import { Config } from './config-data';

/**
 * A function with no inputs or outputs, used in the config subscription model.
 */
export type ConfigSubscriber = () => void;

/**
 * Service that provides access to the client-side configuration data.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigManager {
  private static storageKey = 'Config';
  private static Data = new Config();
  private static testers = new Array<string>('empyrealhell', 'lobosjr');

  private static subscribers = new Array<ConfigSubscriber>();

  /**
   * Gets the client-side config data. This is a static reference and can be
   * stored and manipulated without the need to call this method again.
   */
  public GetConfig(): Config {
    return ConfigManager.Data;
  }

  /**
   * Subscribes a function to be called every time the config is saved.
   * @param subscriber A function to be called back during save.
   */
  public Subscribe(subscriber: ConfigSubscriber): void {
    ConfigManager.subscribers.push(subscriber);
  }

  /**
   * Determines if the logged-in user is a tester.
   */
  public IsTester(): boolean {
    return ConfigManager.testers.indexOf(ConfigManager.Data.Authentication.User) >= 0;
  }

  /**
   * Saves the config data to the client's local storage.
   */
  public Save(): void {
    if (!this.IsTester()) {
      ConfigManager.Data.Layout = new Array<string>('Console');
    }
    localStorage.setItem(ConfigManager.storageKey, JSON.stringify(ConfigManager.Data));
    for (const subscriber of ConfigManager.subscribers) {
      subscriber.call(subscriber);
    }
  }

  /**
   * Loads the config data from the client's local storage.
   */
  public Load(): void {
    const temp = localStorage.getItem(ConfigManager.storageKey);
    Object.assign(ConfigManager.Data, JSON.parse(temp));
    if (!this.IsTester()) {
      ConfigManager.Data.Layout = new Array<string>('Console');
    }
  }
}
