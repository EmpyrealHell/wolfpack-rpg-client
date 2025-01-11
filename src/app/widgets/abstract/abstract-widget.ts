import { WidgetComponent } from 'src/app/components/widget-factory/widget.component';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { CommandService } from 'src/app/services/command/command-service';
import { EventSubService } from 'src/app/services/eventsub/eventsub.service';
import { ClientDataService } from 'src/app/services/client-data/client-data-service';
import { AudioPlayerService } from 'src/app/services/audio-player/audio-player-service';

export abstract class AbstractWidgetComponent implements WidgetComponent {
  audioPlayerService: AudioPlayerService | undefined;
  clientDataService: ClientDataService | undefined;
  eventSubService: EventSubService | undefined;
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
    console.log(`activating widget ${this.name}`);
    this.username = this.configManager?.getConfig().authentication.user ?? '';
    const widgetId = `${this.name}-widget`;
    if (this.commandService) {
      this.subscribeToResponses(widgetId, this.commandService);
      this.commandService.replayHistory(widgetId);
      if (this.eventSubService) {
        this.sendInitialCommands(this.commandService);
      }
    }
  }
}
