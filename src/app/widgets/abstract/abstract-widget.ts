import { WidgetComponent } from 'src/app/components/widget-factory/widget.component';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { CommandService } from 'src/app/services/command/command-service';
import { MatRipple } from '@angular/material/core';

export abstract class AbstractWidgetComponent implements WidgetComponent {
  ircService: IrcService | undefined;
  configManager: ConfigManager | undefined;
  commandService: CommandService | undefined;
  name = 'abstract';
  username = '';

  protected abstract subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void;
  protected abstract sendInitialCommands(commandService: CommandService): void;

  onActivate(): void {
    this.username = this.configManager?.getConfig().authentication.user ?? '';
    const widgetId = `${this.name}-widget`;
    if (this.commandService) {
      this.subscribeToResponses(widgetId, this.commandService);
      this.commandService.replayHistory(widgetId);
      if (this.ircService) {
        this.sendInitialCommands(this.commandService);
      }
    }
  }
}
