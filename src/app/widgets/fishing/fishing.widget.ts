import { Component } from '@angular/core';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { CommandService } from 'src/app/services/command/command-service';
import { MatTableDataSource } from '@angular/material/table';

/**
 * Widget used to display character data.
 *
 * TODO: Add paging to leaderboard and session history based on height
 */
@Component({
  selector: 'app-fishing-widget',
  templateUrl: './fishing.widget.html',
})
export class FishingWidgetComponent extends AbstractWidgetComponent {
  private static defaultHookMessage = 'You got a bite!';

  private sessionHistory: CatchData[] = [];
  private personalHistory: CatchData[] = [];
  private leaderboard: CatchData[] = [];

  private newPersonalBest = false;
  private readingRecord: CatchData | undefined = undefined;

  lineStatus = LineStatus.Idle;
  hookMessage: string | undefined = undefined;
  sessionTableSource = new MatTableDataSource(this.sessionHistory);
  personalTableSource = new MatTableDataSource(this.personalHistory);
  leaderboardTableSource = new MatTableDataSource(this.leaderboard);

  private addSessionData(data: CatchData): void {
    this.sessionHistory.unshift(data);
    this.sessionTableSource.data = this.sessionHistory;
  }

  private addOrUpdateLeaderboard(
    fish: string,
    user: string,
    weight: number
  ): void {
    const existing = this.leaderboard.filter(value => value.fish === fish);
    if (existing && existing.length > 0) {
      const record = existing[0];
      record.user = user;
      record.weight = weight;
    } else {
      this.leaderboard.push(new CatchData(fish, user, 999.99, weight));
    }
    this.leaderboardTableSource.data = this.leaderboard;
  }

  private handleLeaderboard(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'record') {
      const fish = groups.get('fish') ?? 'mystery fish';
      const user = groups.get('user') ?? 'some user';
      const weight = Number(groups.get('size')) ?? 999.99;
      this.addOrUpdateLeaderboard(fish, user, weight);
    }
  }

  private handleList(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    console.log('fish list!');
    console.log(`${name}:${id}`);
    console.log(groups);
    if (id === 'fishInfo') {
      const fish = groups.get('fish');
      if (fish) {
        this.personalHistory.push(new CatchData(fish, this.username, 0, 0));
        this.personalTableSource.data = this.personalHistory;
        this.commandService?.sendCommandWithArguments('fishing', 'detail', {
          id: this.personalHistory.length,
        });
      }
    } else if (id === 'size') {
      this.personalHistory.length = 0;
      this.personalTableSource.data = this.personalHistory;
    }
  }

  private handleDetail(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'name') {
      const fish = groups.get('fish');
      if (fish) {
        const filter = this.personalHistory.filter(x => x.fish === fish);
        if (filter && filter.length > 0) {
          this.readingRecord = filter[0];
        }
      }
    } else if (this.readingRecord) {
      if (id === 'length') {
        this.readingRecord.length = Number(groups.get('length') ?? 0);
      } else if (id === 'weight') {
        this.readingRecord.weight = Number(groups.get('weight') ?? 0);
      } else if (id === 'size') {
        this.readingRecord.category = groups.get('size') ?? '';
        this.readingRecord = undefined;
        this.personalTableSource.data = this.personalHistory;
        // } else if (id === 'flavorText') {
        //   this.readingRecord.description = groups.get('flavorText') ?? '';
        //   this.readingRecord = undefined;
        //   this.personalTableSource.data = this.personalHistory;
      }
    }
  }

  private handleCast(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'confirmation') {
      this.lineStatus = LineStatus.InWater;
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
      this.lineStatus = LineStatus.InWater;
      this.hookMessage = undefined;
    } else if (id === 'alreadyHooked') {
      this.lineStatus = LineStatus.FishHooked;
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
      this.lineStatus = LineStatus.Idle;
      this.hookMessage = undefined;
      const fish = groups.get('fish') ?? 'mystery fish';
      const length = Number(groups.get('length') ?? 0);
      const weight = Number(groups.get('weight') ?? 0);
      const catchData = new CatchData(fish, this.username, length, weight);
      this.addSessionData(catchData);
      if (this.newPersonalBest) {
        this.newPersonalBest = false;
        const history = this.personalHistory.filter(x => x.fish === fish);
        if (history && history.length > 0) {
          history[0].length = length;
          history[0].weight = weight;
        } else {
          this.personalHistory.push(catchData);
        }
        this.personalTableSource.data = this.personalHistory;
      }
    } else if (id === 'newRecord') {
      this.newPersonalBest = true;
    }
  }

  private handleHooked(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    this.lineStatus = LineStatus.FishHooked;
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
    this.lineStatus = LineStatus.Idle;
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
      'list',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups) =>
        this.handleList(name, id, groups, subGroups)
    );

    commandService.subscribeToCommand(
      'fishing',
      'detail',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups) =>
        this.handleDetail(name, id, groups, subGroups)
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
    commandService.sendInitialCommand('fishing', 'leaderboard');
    commandService.sendInitialCommand('fishing', 'list');
  }

  getLeader(fish: string): CatchData | undefined {
    const current = this.leaderboard.filter(value => value.fish === fish);
    if (current && current.length > 0) {
      return current[0];
    }
    return undefined;
  }

  getPersonal(fish: string): CatchData | undefined {
    const current = this.personalHistory.filter(value => value.fish === fish);
    if (current && current.length > 0) {
      return current[0];
    }
    return undefined;
  }

  getCastIcon(): string {
    switch (this.lineStatus) {
      case LineStatus.InWater:
        return 'waiting';
      case LineStatus.FishHooked:
        return 'hook';
      default:
        return 'cast';
    }
  }

  getCastMessage(): string {
    switch (this.lineStatus) {
      case LineStatus.InWater:
        return 'Waiting...';
      case LineStatus.FishHooked:
        return 'Reel in!';
      default:
        return 'Cast line';
    }
  }

  getHookMessage(): string {
    return this.hookMessage ?? '\xA0';
  }

  hook() {
    switch (this.lineStatus) {
      case LineStatus.Idle:
        this.commandService?.sendCommand('fishing', 'cast');
        break;
      case LineStatus.FishHooked:
        this.commandService?.sendCommand('fishing', 'catch');
        break;
    }
  }
}

export class CatchData {
  category = '';
  description = '';

  constructor(
    public fish: string,
    public user: string,
    public length: number,
    public weight: number
  ) {}
}

export enum LineStatus {
  Idle,
  InWater,
  FishHooked,
}
