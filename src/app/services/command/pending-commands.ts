import { CommandWrapper } from './command-wrapper';
import { EventSubService } from '../eventsub/eventsub.service';

/**
 * Wrapper that holds all of the pending commands from the command data config.
 */
export class PendingCommands extends CommandWrapper {
  constructor(private eventSubService: EventSubService) {
    super();
  }

  /**
   * Sends the confirmation command, used to accept a party invite or
   * confirm the release of a pet.
   */
  yes(): void {
    const command = this.getCommandString('pending', 'no', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the deconfirm command, used to decline a party invite or cancel
   * the pending release of a pet.
   */
  no(): void {
    const command = this.getCommandString('pending', 'no', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to cancel a respec.
   */
  cancel(): void {
    const command = this.getCommandString('pending', 'cancel', 'command');
    this.eventSubService.send(command);
  }

  /**
   * Sends the command to set your class, whether initially or through a respec.
   * @param id The id of the pet.
   */
  setClass(id: '1' | '2' | '3' | '4' | '5'): void {
    const raw = this.getCommandString('pending', 'setClass', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.eventSubService.send(command);
  }
}
