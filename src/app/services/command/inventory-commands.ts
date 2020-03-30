import { CommandWrapper } from './command-wrapper';
import { IrcService } from '../irc/irc.service';

/**
 * Wrapper that holds all of the inventory commands from the command data config.
 */
export class InventoryCommands extends CommandWrapper {
  constructor(private ircService: IrcService) {
    super();
  }

  /**
   * Sends the command to get the details of an item.
   * @param id The id of the item.
   */
  detail(id: string): void {
    const raw = this.getCommandString('inventory', 'detail', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.ircService.send(command);
  }

  /**
   * Sends the command to equip an item.
   * @param id The id of the item.
   */
  equip(id: string): void {
    const raw = this.getCommandString('inventory', 'detail', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.ircService.send(command);
  }

  /**
   * Sends the command to list your inventory contents.
   */
  list(): void {
    const command = this.getCommandString('inventory', 'list', 'command');
    this.ircService.send(command);
  }

  /**
   * Sends the command to equip an item.
   * @param id The id of the item.
   */
  unequip(id: string): void {
    const raw = this.getCommandString('inventory', 'unequip', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.ircService.send(command);
  }
}
