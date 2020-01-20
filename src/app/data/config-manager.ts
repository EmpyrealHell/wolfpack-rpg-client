import { Config } from './config-data';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigManager {
  private static storageKey = 'Config';
  private Data = new Config();

  GetConfig() {
    return this.Data;
  }

  public Save() {
    localStorage.setItem(ConfigManager.storageKey, JSON.stringify(this.Data));
  }

  public Load() {
    const temp = localStorage.getItem(ConfigManager.storageKey);
    Object.assign(this.Data, JSON.parse(temp));
  }
}
