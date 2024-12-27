import { CommandWrapper } from './command-wrapper';
import { EventSubService } from '../eventsub/eventsub.service';

/**
 * Wrapper that holds all of the shop commands from the command data config.
 */
export class ShopCommands extends CommandWrapper {
  constructor(private eventSubService: EventSubService) {
    super();
  }

  /**
   * Sends the command to place a bet.
   * @param value The amout to bet.
   */
  bet(value: string): void {
    const raw = this.getCommandString('shop', 'bet', 'command');
    const command = this.replaceProperty(raw, 'value', value);
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to gloat about your level.
   */
  gloat(): void {
    const command = this.getCommandString('shop', 'gloat', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to gloat about your biggest catch.
   * @param id The id of the fish type to gloat about.
   */
  gloatFish(id: string): void {
    const command = this.getCommandString('shop', 'gloat', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to gloat about your currently-summoned pet.
   */
  gloatPet(): void {
    const command = this.getCommandString('shop', 'gloatPet', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to display the shop help message.
   */
  help(): void {
    const command = this.getCommandString('shop', 'help', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to start the respec process.
   */
  respec(): void {
    const command = this.getCommandString('shop', 'respec', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to show the stats of another user.
   * @param username The name of a user.
   */
  stats(username: string): void {
    const raw = this.getCommandString('shop', 'stats', 'command');
    const command = this.replaceProperty(raw, 'username', username);
    this.eventSubService.send(command);
  }
}
