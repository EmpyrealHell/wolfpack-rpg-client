import { IrcService } from 'src/app/irc/irc.service';
import { ConfigManager } from 'src/app/data/config-manager';

export interface WidgetComponent {
  ircService: IrcService;
  configManager: ConfigManager;
}
