import { Component } from '@angular/core';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { CommandService } from 'src/app/services/command/command-service';
import { MatTableDataSource } from '@angular/material/table';
import { Utils } from 'src/app/util/utils';
import { CatchData, LineStatus, Tournament } from './model/fish';

/**
 * Widget used to display character data.
 *
 * TODO: Add paging to leaderboard and session history based on height
 */
@Component({
  selector: 'app-fishing-widget',
  templateUrl: './fishing.widget.html',
  standalone: false,
})
export class FishingWidgetComponent extends AbstractWidgetComponent {
  name = 'Fishing';
  private static defaultHookMessage = 'You got a bite!';

  private sessionHistory: CatchData[] = [];
  private personalHistory: CatchData[] = [];
  private leaderboard: CatchData[] = [];

  private newPersonalBest = false;

  lineStatus = LineStatus.Idle;
  hookMessage: string | undefined = undefined;
  tournament: Tournament | undefined;
  nextTournament: Date | undefined;
  sessionTableSource = new MatTableDataSource(this.sessionHistory);
  personalTableSource = new MatTableDataSource(this.personalHistory);
  leaderboardTableSource = new MatTableDataSource(this.leaderboard);

  private addSessionData(data: CatchData): void {
    this.sessionHistory.unshift(data);
    this.sessionTableSource.data = this.sessionHistory;
    if (this.newPersonalBest) {
      this.newPersonalBest = false;
      const history = this.personalHistory.filter(x => x.fish === data.fish);
      if (history && history.length > 0) {
        history[0].length = data.length;
        history[0].weight = data.weight;
      } else {
        this.personalHistory.push(data);
      }
      this.personalTableSource.data = this.personalHistory;
    }
  }

  private handleLeaderboard(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'compact') {
      for (const sub of subGroups) {
        const fish = sub.get('fish') ?? 'unknown';
        const length = Number(sub.get('length') ?? 0);
        const weight = Number(sub.get('weight') ?? 0);
        const user = sub.get('user') ?? 'unknown';
        const records = this.leaderboard.filter(x => x.fish === fish);
        if (records && records.length > 0) {
          records[0].user = user;
          records[0].length = length;
          records[0].weight = weight;
        } else {
          this.leaderboard.push(new CatchData(fish, user, length, weight, 0));
        }
      }
      this.leaderboardTableSource.data = this.leaderboard;
    }
  }

  private handleDetail(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'compact') {
      for (const sub of subGroups) {
        const fish = sub.get('fish') ?? 'unknown';
        const length = Number(sub.get('length') ?? 0);
        const weight = Number(sub.get('weight') ?? 0);
        const records = this.personalHistory.filter(x => x.fish === fish);
        if (records && records.length > 0) {
          records[0].length = length;
          records[0].weight = weight;
        } else {
          this.personalHistory.push(
            new CatchData(fish, this.username, length, weight, 0)
          );
        }
        this.personalTableSource.data = this.personalHistory;
      }
    }
  }

  private handleCast(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
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
    subGroups: Array<Map<string, string>>,
    date: number
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
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'newRecord') {
      this.newPersonalBest = true;
    } else if (id === 'confirmation') {
      this.lineStatus = LineStatus.Idle;
      this.hookMessage = undefined;
      const fish = groups.get('fish') ?? 'mystery fish';
      const length = Number(groups.get('length') ?? 0);
      const weight = Number(groups.get('weight') ?? 0);
      const catchData = new CatchData(fish, this.username, length, weight, 0);
      this.addSessionData(catchData);
    } else if (id === 'tournament') {
      if (!this.tournament) {
        this.tournament = new Tournament();
        this.commandService?.sendCommand('fishing', 'next');
      }
      this.lineStatus = LineStatus.Idle;
      this.hookMessage = undefined;
      const length = Number(groups.get('length') ?? 0);
      const weight = Number(groups.get('weight') ?? 0);
      const fish = groups.get('fish') ?? 'mystery fish';
      const points = Number(groups.get('points') ?? 0);
      this.tournament.rank = Number(groups.get('rank') ?? 0);
      this.tournament.userPoints = Number(groups.get('total') ?? 0);
      const catchData = new CatchData(
        fish,
        this.username,
        length,
        weight,
        points
      );
      this.addSessionData(catchData);
    } else if (id === 'tournamentLegacy') {
      if (!this.tournament) {
        this.tournament = new Tournament();
        this.commandService?.sendCommand('fishing', 'next');
      }
      this.lineStatus = LineStatus.Idle;
      this.hookMessage = undefined;
      const fish = groups.get('fish') ?? 'mystery fish';
      const points = Number(groups.get('points') ?? 0);
      this.tournament.rank = Number(groups.get('rank') ?? 0);
      this.tournament.userPoints = Number(groups.get('total') ?? 0);
      const catchData = new CatchData(fish, this.username, 0, 0, points);
      this.addSessionData(catchData);
    }
  }

  private handleHooked(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    this.lineStatus = LineStatus.FishHooked;
    this.hookMessage =
      groups.get('message') ?? FishingWidgetComponent.defaultHookMessage;
    if (this.configManager?.getConfig().settings.playSounds) {
      this.audioPlayerService?.play('effect-hooked');
    }
  }

  private handleGotAway(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    this.lineStatus = LineStatus.Idle;
    this.hookMessage = 'The fish got away';
    setTimeout(() => {
      this.hookMessage = undefined;
    }, 5000);
  }

  private handleNext(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number,
    isReplay?: boolean
  ): void {
    if (id === 'timeLeft') {
      const time = (groups.get('time') ?? '00:00:00').split(':');
      const toAdd =
        parseInt(time[0]) * 60 * 60 * 1000 +
        parseInt(time[1]) * 60 * 1000 +
        parseInt(time[2]) * 1000;
      if (!this.tournament) {
        this.tournament = new Tournament();
      }
      this.tournament.endTime = new Date(date + toAdd);
      this.nextTournament = undefined;
    } else if (id === 'toNext') {
      const time = (groups.get('time') ?? '00:00:00').split(':');
      const toAdd =
        parseInt(time[0]) * 60 * 60 * 1000 +
        parseInt(time[1]) * 60 * 1000 +
        parseInt(time[2]) * 1000;
      if (!this.tournament) {
        this.tournament = new Tournament();
        if (!isReplay) {
          this.commandService?.sendCommand('fishing', 'results');
        }
      }
      this.nextTournament = new Date(date + toAdd);
      this.tournament.endTime = undefined;
    }
  }

  private handleResults(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (!this.tournament) {
      this.tournament = new Tournament();
    }
    this.tournament.endTime = Utils.parseDateFromBot(groups.get('ended'));
    this.tournament.participants = Number(groups.get('participants') ?? 0);
    this.tournament.winner = groups.get('winner') ?? 'unknown';
    this.tournament.winnerPoints = Number(groups.get('winnerPoints') ?? 0);
    this.tournament.rank = Number(groups.get('rank') ?? 0);
    this.tournament.userPoints = Number(groups.get('userPoints') ?? 0);
  }

  private handleTournamentStart(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    this.tournament = new Tournament();
    const duration = Number(groups.get('duration') ?? 0);
    this.tournament.endTime = new Date(Date.now() + duration * 60 * 1000);
    this.audioPlayerService?.play('effect-tournament-start');
  }

  private handleTournamentEnd(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (!this.tournament) {
      this.tournament = new Tournament();
      this.tournament.endTime = new Date(Date.now());
    }
    if (id.indexOf('End') !== -1) {
      this.tournament.participants = Number(groups.get('participants') ?? 0);
      this.tournament.winner = groups.get('winner') ?? 'unknown';
      this.tournament.winnerPoints = Number(groups.get('points') ?? 0);
      this.commandService?.sendCommand('fishing', 'results');
    }
    this.commandService?.sendCommand('fishing', 'next');
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
      (name, id, groups, subGroups, date) =>
        this.handleLeaderboard(name, id, groups, subGroups, date)
    );

    commandService.subscribeToCommand(
      'fishing',
      'list',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) =>
        this.handleDetail(name, id, groups, subGroups, date)
    );

    commandService.subscribeToCommand(
      'fishing',
      'cast',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) =>
        this.handleCast(name, id, groups, subGroups, date)
    );

    commandService.subscribeToCommand(
      'fishing',
      'cast',
      'responses',
      'error',
      id,
      (name, id, groups, subGroups, date) =>
        this.handleCastError(name, id, groups, subGroups, date)
    );

    commandService.subscribeToCommand(
      'fishing',
      'catch',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) =>
        this.handleCatch(name, id, groups, subGroups, date)
    );

    commandService.subscribeToCommand(
      'fishing',
      'next',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date, isReplay) =>
        this.handleNext(name, id, groups, subGroups, date, isReplay)
    );

    commandService.subscribeToCommand(
      'fishing',
      'results',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) =>
        this.handleResults(name, id, groups, subGroups, date)
    );

    commandService.subscribeToMessage(
      'fishing',
      'fishHooked',
      'fishingWidget',
      (name, id, groups, subGroups, date) =>
        this.handleHooked(name, id, groups, subGroups, date)
    );

    commandService.subscribeToMessage(
      'fishing',
      'gotAway',
      'fishingWidget',
      (name, id, groups, subGroups, date) =>
        this.handleGotAway(name, id, groups, subGroups, date)
    );

    commandService.subscribeToMessage(
      'fishing',
      'tournamentStart',
      'fishingWidget',
      (name, id, groups, subGroups, date) =>
        this.handleTournamentStart(name, id, groups, subGroups, date)
    );

    commandService.subscribeToMessage(
      'fishing',
      'tournamentEnd',
      'fishingWidget',
      (name, id, groups, subGroups, date) =>
        this.handleTournamentEnd(name, id, groups, subGroups, date)
    );

    commandService.subscribeToMessage(
      'fishing',
      'tournamentEndEmpty',
      'fishingWidget',
      (name, id, groups, subGroups, date) =>
        this.handleTournamentEnd(name, id, groups, subGroups, date)
    );
  }

  protected sendInitialCommands(commandService: CommandService): void {
    commandService.sendInitialCommand('fishing', 'leaderboard');
    commandService.sendInitialCommand('fishing', 'list');
    commandService.sendInitialCommand('fishing', 'next');
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

  isTournamentOver(): boolean {
    if (this.tournament && this.tournament.endTime) {
      return this.tournament.endTime.getTime() <= Date.now();
    }
    return true;
  }

  getTimeString(target: Date | undefined): string {
    if (!target) {
      return 'unknown';
    }
    const hoursInMillis = 60 * 60 * 1000;
    const minutesInMillis = 60 * 1000;
    const secondsInMillis = 1000;
    let toTarget = target.getTime() - Date.now();
    const hours = Math.floor(toTarget / hoursInMillis);
    if (hours > 0) {
      const suffix = hours === 1 ? '' : 's';
      return `${hours} hour${suffix}`;
    }
    toTarget -= hours * hoursInMillis;
    const minutes = Math.floor(toTarget / minutesInMillis);
    if (minutes > 0) {
      const suffix = minutes === 1 ? '' : 's';
      return `${minutes} minute${suffix}`;
    }
    toTarget -= minutes * minutesInMillis;
    const seconds = Math.floor(toTarget / secondsInMillis);
    const suffix = seconds === 1 ? '' : 's';
    return `${seconds} second${suffix}`;
  }

  toOrdinal(rank: number): string {
    if (rank <= 0) {
      return `${rank}`;
    }

    const tens = rank % 100;
    if (tens >= 11 && tens <= 13) {
      return `${rank}th`;
    }

    const ones = rank % 10;
    switch (ones) {
      case 1:
        return `${rank}st`;
      case 2:
        return `${rank}nd`;
      case 3:
        return `${rank}rd`;
      default:
        return `${rank}th`;
    }
  }

  getTournamentHeight(): number {
    const base = 112;
    const headerHeight = 46;
    const rowHeight = 31;
    const margin = 16;
    let amount = base + margin;
    if (this.tournament && !this.isTournamentOver()) {
      amount += headerHeight;
      if (this.tournament.rank > 0) {
        amount += rowHeight;
      }
    }
    if (this.tournament && this.isTournamentOver()) {
      if (this.nextTournament) {
        amount += headerHeight;
      }
      if (this.tournament.winner) {
        amount += rowHeight;
      }
      if (this.tournament.rank > 0) {
        amount += rowHeight;
      }
    }
    if (!this.tournament && !this.nextTournament) {
      amount += rowHeight;
    }
    return amount;
  }
}
