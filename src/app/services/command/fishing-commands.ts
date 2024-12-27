import { CommandWrapper } from './command-wrapper';
import { EventSubService } from '../eventsub/eventsub.service';

/**
 * Wrapper that holds all of the fishing commands from the command data config.
 */
export class FishingCommands extends CommandWrapper {
  constructor(private eventSubService: EventSubService) {
    super();
  }

  /**
   * Sends the command to start fishing.
   */
  cast(): void {
    const command = this.getCommandString('fishing', 'cast', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to reel in a fish.
   */
  catch(): void {
    const command = this.getCommandString('fishing', 'catch', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command get details for a specific fish.
   * @param id The id of the fish to get details for.
   */
  detail(id: string): void {
    const raw = this.getCommandString('fishing', 'detail', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to get the fishing leaderboard.
   */
  leaderboard(): void {
    const command = this.getCommandString('fishing', 'leaderboard', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to list caught fish.
   */
  list(): void {
    const command = this.getCommandString('fishing', 'list', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command release a specific fish.
   * @param id The id of the fish to release.
   */
  release(id: string): void {
    const raw = this.getCommandString('fishing', 'release', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.eventSubService.send(command);
  }
}
