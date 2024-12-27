import { CommandWrapper } from './command-wrapper';
import { EventSubService } from '../eventsub/eventsub.service';

/**
 * Wrapper that holds all of the dungeon commands from the command data config.
 */
export class DungeonCommands extends CommandWrapper {
  constructor(private eventSubService: EventSubService) {
    super();
  }

  /**
   * Sends the command to retrieve daily bonus eligibility.
   */
  daily(): void {
    const command = this.getCommandString('dungeon', 'daily', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to retrieve details about a specific dungeon.
   * @param id The id of the dungeon to get details for.
   */
  detail(id: string): void {
    const raw = this.getCommandString('dungeon', 'detail', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to leave the group finder queue.
   */
  leave(): void {
    const command = this.getCommandString('dungeon', 'leave', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to get the url for the list of dungeons.
   */
  list(): void {
    const command = this.getCommandString('dungeon', 'list', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to queue for the group finder.
   */
  queue(): void {
    const command = this.getCommandString('dungeon', 'queue', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to get the queue wait time.
   */
  queueTime(): void {
    const command = this.getCommandString('dungeon', 'queueTime', 'command');
    this.eventSubService.send(command);
  }
}
