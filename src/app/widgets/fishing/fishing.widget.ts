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
  private static defaultHookMessage = 'You got a bite!';

  records = new Array<FishingRecord>();
  isCast = false;
  hookMessage: string | undefined = undefined;
  recentCatch: CatchData | undefined = undefined;

  private handleLeaderboard(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'record') {
      const fish = groups.get('fish') ?? 'mystery fish';
      const user = groups.get('user') ?? 'some user';
      const size = groups.get('size') ?? 'unknown size';
      this.records.push(new FishingRecord(fish, user, size));
    }
  }

  private handleCast(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'confirmation') {
      this.isCast = true;
      this.hookMessage = undefined;
    }
  }

  private handleCastError(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'alreadyCast') {
      this.isCast = true;
      this.hookMessage = undefined;
    } else if (id === 'alreadyHooked') {
      this.isCast = true;
      this.hookMessage = FishingWidgetComponent.defaultHookMessage;
    }
  }

  private handleCatch(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'confirmation') {
      this.isCast = false;
      this.hookMessage = undefined;
      const name = groups.get('name') ?? 'mystery fish';
      const length = Number(groups.get('length') ?? 0);
      const weight = Number(groups.get('weight') ?? 0);
      this.recentCatch = new CatchData(name, length, weight);
      setTimeout(() => {
        this.recentCatch = undefined;
      }, 5000);
    }
  }

  private handleHooked(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    this.hookMessage =
      groups.get('message') ?? FishingWidgetComponent.defaultHookMessage;
    const audio = new Audio('./assets/effect-hooked.mp3');
    audio.load();
    audio.play();
  }

  private handleGotAway(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    this.isCast = false;
    this.hookMessage = 'The fish got away';
    setTimeout(() => {
      this.hookMessage = undefined;
    }, 5000);
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

    commandService.subscribeToCommand(
      'fishing',
      'cast',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups) =>
        this.handleCast(name, id, groups, subGroups)
    );

    commandService.subscribeToCommand(
      'fishing',
      'cast',
      'responses',
      'error',
      id,
      (name, id, groups, subGroups) =>
        this.handleCastError(name, id, groups, subGroups)
    );

    commandService.subscribeToCommand(
      'fishing',
      'catch',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups) =>
        this.handleCatch(name, id, groups, subGroups)
    );

    commandService.subscribeToMessage(
      'fishing',
      'fishHooked',
      'fishingWidget',
      (name, id, groups, subGroups) =>
        this.handleHooked(name, id, groups, subGroups)
    );

    commandService.subscribeToMessage(
      'fishing',
      'gotAway',
      'fishingWidget',
      (name, id, groups, subGroups) =>
        this.handleGotAway(name, id, groups, subGroups)
    );
  }

  protected sendInitialCommands(commandService: CommandService): void {
    // commandService.sendCommand('fishing', 'leaderboard');
  }

  getCastIcon() {
    if (!this.isCast) {
      return 'cast';
    } else if (!this.hookMessage) {
      return 'waiting';
    } else {
      return 'hook';
    }
  }

  getCastMessage() {
    if (!this.isCast) {
      return 'Cast line';
    } else if (!this.hookMessage) {
      return 'Waiting...';
    } else {
      return 'Reel in!';
    }
  }

  hook() {
    console.log(
      `The button was clicked! isCast: ${this.isCast}; hookMessage: ${this.hookMessage}`
    );
    if (!this.isCast) {
      this.commandService?.sendCommand('fishing', 'cast');
    } else if (this.hookMessage) {
      this.commandService?.sendCommand('fishing', 'catch');
    }
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

export class CatchData {
  constructor(
    public fish: string,
    public length: number,
    public weight: number
  ) {}
}
