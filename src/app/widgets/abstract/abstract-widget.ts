import { WidgetComponent } from 'src/app/components/widget-factory/widget.component';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { CommandService } from 'src/app/services/command/command-service';
import * as CommandData from '../../services/command/command-data.json';

export abstract class AbstractWidgetComponent implements WidgetComponent {
  ircService: IrcService | undefined;
  configManager: ConfigManager | undefined;
  commandService: CommandService | undefined;
  name = 'abstract';

  protected abstract subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void;
  protected abstract sendInitialCommands(commandService: CommandService): void;

  onActivate(): void {
    const widgetId = `${this.name}-widget`;
    if (this.commandService) {
      this.commandService = this.commandService.instance;
      this.subscribeToResponses(widgetId, this.commandService);
      this.commandService.replayHistory(widgetId);
      if (this.ircService) {
        this.sendInitialCommands(this.commandService);
      }
    }
  }
}
