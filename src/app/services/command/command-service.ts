import { Injectable } from '@angular/core';
import { IrcService } from '../irc/irc.service.js';
import { CommandWrapper } from './command-wrapper.js';

/**
 * Service that sends messages based on the command data json config file.
 */
@Injectable({
  providedIn: 'root',
})
export class CommandService extends CommandWrapper {
  constructor(private ircService: IrcService) {
    super();
  }

  /**
   * Sends a message to everyone in your current party.
   * @param message The message to send.
   */
  sendChatMessage(message: string): void {
    const raw = this.getCommandString('chat', 'message', 'command');
    const command = this.replaceProperty(raw, 'message', message);
    this.ircService.send(command);
  }

  /**
   * Sends the command to retrieve daily bonus eligibility.
   */
  sendDungeonDaily(): void {
    const command = this.getCommandString('dungeon', 'daily', 'command');
    this.ircService.send(command);
  }

  /**
   * Sends the command to retrieve details about a specific dungeon.
   */
  sendDungeonDetail(id: string): void {
    const raw = this.getCommandString('dungeon', 'detail', 'command');
    const command = this.replaceProperty(raw, 'id', id);
    this.ircService.send(command);
  }
}
