import { ConfigManager } from 'src/app/services/data/config-manager';
import { CommandService } from 'src/app/services/command/command-service';
import { EventSubService } from 'src/app/services/eventsub/eventsub.service';
import { ClientDataService } from 'src/app/services/client-data/client-data-service';
import { AudioPlayerService } from 'src/app/services/audio-player/audio-player-service';

/**
 * Interface all widgets implement to receive access to app services.
 */
export interface WidgetComponent {
  /**
   * Audio player service used to play audio with proper settings.
   */
  audioPlayerService: AudioPlayerService | undefined;
  /**
   * Client data service used to load client data reference.
   */
  clientDataService: ClientDataService | undefined;
  /**
   * EventSub service used to receive whisper events.
   */
  eventSubService: EventSubService | undefined;
  /**
   * Config manager used to save & load user config data.
   */
  configManager: ConfigManager | undefined;
  /**
   * Command service used to send commands and listen for their responses.
   */
  commandService: CommandService | undefined;
  /**
   * The name of the component.
   */
  name: string;

  onActivate(): void;
}
