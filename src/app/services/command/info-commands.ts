import { CommandWrapper } from './command-wrapper';
import { IrcService } from '../irc/irc.service';

/**
 * Wrapper that holds all of the info commands from the command data config.
 */
export class InfoCommands extends CommandWrapper {
  constructor(private ircService: IrcService) {
    super();
  }

  /**
   * Sends the command to report a bug.
   * @param message The text of the bug report.
   */
  bugReport(message: string): void {
    const raw = this.getCommandString('info', 'bugReport', 'command');
    const command = this.replaceProperty(raw, 'message', message);
    this.ircService.send(command);
  }

  /**
   * Sends the command to get the class distribution info.
   */
  classes(): void {
    const command = this.getCommandString('info', 'classes', 'command');
    this.ircService.send(command);
  }

  /**
   * Sends the command to show your coin amount.
   */
  coins(): void {
    const command = this.getCommandString('info', 'coins', 'command');
    this.ircService.send(command);
  }

  /**
   * Sends the command to show your xp amount.
   */
  experience(): void {
    const command = this.getCommandString('info', 'experience', 'command');
    this.ircService.send(command);
  }

  /**
   * Sends the command to display the help message.
   */
  help(): void {
    const command = this.getCommandString('info', 'help', 'command');
    this.ircService.send(command);
  }

  /**
   * Sends the command to display help info on the class system.
   */
  levelHelp(): void {
    const command = this.getCommandString('info', 'levelHelp', 'command');
    this.ircService.send(command);
  }

  /**
   * Sends the command to show your xp and coin amounts.
   */
  stats(): void {
    const command = this.getCommandString('info', 'stats', 'command');
    this.ircService.send(command);
  }

  /**
   * Sends the command to display help info on the wolfcoin system.
   */
  wolfcoinHelp(): void {
    const command = this.getCommandString('info', 'wolfcoinHelp', 'command');
    this.ircService.send(command);
  }
}
