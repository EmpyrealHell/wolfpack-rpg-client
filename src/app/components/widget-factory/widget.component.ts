import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { CommandService } from 'src/app/services/command/command-service';
import { MatRipple } from '@angular/material/core';

/**
 * Interface all widgets implement to receive access to app services.
 */
export interface WidgetComponent {
  /**
   * IRC service used to receive whisper events.
   */
  ircService: IrcService | undefined;
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
