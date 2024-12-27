import { CommandWrapper } from './command-wrapper';
import { EventSubService } from '../eventsub/eventsub.service';

/**
 * Wrapper that holds all of the chat commands from the command data config.
 */
export class ChatCommands extends CommandWrapper {
  constructor(private eventSubService: EventSubService) {
    super();
  }

  /**
   * Sends a message to everyone in your current party.
   * @param message The message to send.
   */
  message(message: string): void {
    const raw = this.getCommandString('chat', 'message', 'command');
    const command = this.replaceProperty(raw, 'message', message);
    this.eventSubService.send(command);
  }
}
