import { CommandWrapper } from './command-wrapper';
import { EventSubService } from '../eventsub/eventsub.service';

/**
 * Wrapper that holds all of the party commands from the command data config.
 */
export class PartyCommands extends CommandWrapper {
  constructor(private eventSubService: EventSubService) {
    super();
  }

  /**
   * Sends the command to add a user to the party.
   * @param username The name of the user to add.
   */
  add(username: string): void {
    const raw = this.getCommandString('party', 'add', 'command');
    const command = this.replaceProperty(raw, 'username', username);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to create an empty party.
   */
  create(): void {
    const command = this.getCommandString('party', 'create', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to retrieve party data.
   */
  data(): void {
    const command = this.getCommandString('party', 'create', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to remove a user from the party.
   * @param username The name of the user to remove.
   */
  kick(username: string): void {
    const raw = this.getCommandString('party', 'kick', 'command');
    const command = this.replaceProperty(raw, 'username', username);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to leave the party.
   */
  leave(): void {
    const command = this.getCommandString('party', 'leave', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to promote a user to party leader.
   * @param username The name of the user to promote.
   */
  promote(username: string): void {
    const raw = this.getCommandString('party', 'promote', 'command');
    const command = this.replaceProperty(raw, 'username', username);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to start the dungeon.
   * @param id An optional id of a specific dungeon to start.
   */
  start(id?: string): void {
    const raw = this.getCommandString('party', 'start', 'command');
    const command = this.replaceProperty(raw, 'id?', id ? id : '');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to set the party as ready
   */
  ready(): void {
    const command = this.getCommandString('party', 'ready', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to set the party as not ready
   */
  unready(): void {
    const command = this.getCommandString('party', 'unready', 'command');
    this.eventSubService.send(command);
  }
}
