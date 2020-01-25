import { ConfigManager } from 'src/app/data/config-manager';
import { IrcService } from 'src/app/irc/irc.service';

/**
 * Interface all widgets implement to receive access to app services.
 */
export interface WidgetComponent {
  /**
   * IRC service used to receive whisper events.
   */
  ircService: IrcService;
  /**
   * Config manager used to save & load user config data.
   */
  configManager: ConfigManager;
}
