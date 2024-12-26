import { CommandWrapper } from './command-wrapper';
import { EventSubService } from '../eventsub/eventsub.service';

/**
 * Wrapper that holds all of the pets commands from the command data config.
 */
export class PetsCommands extends CommandWrapper {
  constructor(private eventSubService: EventSubService) {
    super();
  }

  /**
   * Sends the command to show the details of a pet.
   * @param id The id of the pet.
   */
  detail(id: string): void {
    const raw = this.getCommandString('pets', 'detail', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to dismiss (set as inactive) a pet.
   * @param id The id of the pet.
   */
  dismiss(id: string): void {
    const raw = this.getCommandString('pets', 'dismiss', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to feed a pet
   * @param id The id of the pet.
   */
  feed(id: string): void {
    const raw = this.getCommandString('pets', 'feed', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to show the pet help message.
   */
  help(): void {
    const command = this.getCommandString('pets', 'help', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to list owned pets.
   */
  list(): void {
    const command = this.getCommandString('pets', 'list', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to release (permanently delete) a pet.
   * @param id The id of the pet.
   */
  release(id: string): void {
    const raw = this.getCommandString('pets', 'release', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to rename a pet.
   * @param id The id of the pet.
   * @param name The name to give the pet.
   */
  rename(id: string, name: string): void {
    const raw = this.getCommandString('pets', 'rename', 'command');
    const command = this.replaceProperties(raw, { id, name });
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to summon a pet.
   * @param id The id of the pet.
   */
  summon(id: string): void {
    const raw = this.getCommandString('pets', 'summon', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.eventSubService.send(command);
  }
}
