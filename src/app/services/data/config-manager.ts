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
  providedIn: 'root',
})
export class ConfigManager {
  private static storageKey = 'Config';
  private static data = new Config();
  private static testers = new Array<string>('empyrealhell', 'lobosjr');

  private static subscribers = new Array<ConfigSubscriber>();

  /**
   * Gets the client-side config data. This is a static reference and can be
   * stored and manipulated without the need to call this method again.
   */
  getConfig(): Config {
    return ConfigManager.data;
  }

  /**
   * Subscribes a function to be called every time the config is saved.
   * @param subscriber A function to be called back during save.
   */
  subscribe(subscriber: ConfigSubscriber): void {
    ConfigManager.subscribers.push(subscriber);
  }

  /**
   * Saves the config data to the client's local storage.
   */
  save(): void {
    localStorage.setItem(
      ConfigManager.storageKey,
      JSON.stringify(ConfigManager.data)
    );
    for (const subscriber of ConfigManager.subscribers) {
      subscriber.call(subscriber);
    }
  }

  /**
   * Loads the config data from the client's local storage.
   */
  load(): void {
    const temp = localStorage.getItem(ConfigManager.storageKey);
    if (temp) {
      Object.assign(ConfigManager.data, JSON.parse(temp));
    }
  }
}
