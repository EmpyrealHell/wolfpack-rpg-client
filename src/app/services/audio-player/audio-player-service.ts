import { Injectable } from '@angular/core';
import { ConfigManager } from '../data/config-manager';

/**
 * Service containing the feature management system.
 */
@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  constructor(private configManager: ConfigManager) {}

  initialize(): void {}

  play(name: string): void {
    const config = this.configManager?.getConfig();
    if (config && config.settings.playSounds) {
      const audio = new Audio(`./assets/${name}.mp3`);
      audio.load();
      audio.volume = config.settings.soundVolume ?? 0.5;
      void audio.play();
    }
  }
}
