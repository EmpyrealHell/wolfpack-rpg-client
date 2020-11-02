import { Component } from '@angular/core';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { CommandService } from 'src/app/services/command/command-service';

/**
 * Widget used to display character data.
 */
@Component({
  selector: 'app-fishing-widget',
  templateUrl: './fishing.widget.html',
})
export class FishingWidgetComponent extends AbstractWidgetComponent {
  records = new Array<FishingRecord>();

  private handleLeaderboard(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'record') {
      const fish = groups.get('fish') ?? 'unknown fish';
      const user = groups.get('user') ?? 'unknown user';
      const size = groups.get('size') ?? 'unknown size';
      this.records.push(new FishingRecord(fish, user, size));
    }
  }

  protected subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void {
    commandService.subscribeToCommand(
      'fishing',
      'leaderboard',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups) =>
        this.handleLeaderboard(name, id, groups, subGroups)
    );
  }

  protected sendInitialCommands(commandService: CommandService): void {
    commandService.sendCommand('fishing', 'leaderboard');
  }
}

export class FishingRecord {
  size: number;

  constructor(public fish: string, public name: string, size: string) {
    this.size = Number(size);
  }

  update(name: string, size: string): void {
    this.name = name;
    this.size = Number(size);
  }
}
