import { Component, Input, OnInit } from '@angular/core';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { WidgetComponent } from 'src/app/components/widget-factory/widget.component';

/**
 * Widget that provides direct access to the communication channel between the
 * authenticated user and the target account.
 */
@Component({
  selector: 'app-console-widget',
  templateUrl: './console.widget.html',
})
export class ConsoleWidgetComponent implements WidgetComponent {
  private static maxHistory = 100;
  private index = -1;

  /**
   * The full chat history to render.
   */
  public consoleData = '';
  /**
   * The command to send as input by the user.
   */
  public command = '';
  /**
   * The name of the widget;
   */
  public name = '';

  /**
   * Reference to the IRC chat service.
   */
  @Input()
  public ircService: IrcService;
  /**
   * Reference to the user's config data manager.
   */
  @Input()
  public configManager: ConfigManager;

  constructor() { }

  private onWhisper(message: string): void {
    this.consoleData += `${message}\n`;
  }

  private sendCommand(): void {
    const message = this.command;
    this.command = '';
    this.ircService.send(message);

    const history = this.configManager.GetConfig().History;
    history.push(message);
    if (history.length > ConsoleWidgetComponent.maxHistory) {
      history.splice(0, 1);
    }
    this.configManager.Save();
    this.index = -1;
  }

  public onActivate(): void {
    this.ircService.register('console-widget', (message) => { this.onWhisper(message); }, true);
    this.consoleData = this.ircService.getHistory();
  }

  private commandFromHistory(index: number): { message: string, index: number } {
    const history = this.configManager.GetConfig().History;
    const clampedIndex = Math.max(Math.min(index, history.length), 0);
    if (clampedIndex <= 0) {
      return {
        message: '',
        index: clampedIndex
      };
    } else {
      return {
        message: history[history.length - clampedIndex],
        index: clampedIndex
      };
    }
  }

  /**
   * Listen to the key presses to check for enter being pressed.
   * @param event Keyboard event passed in by the browser.
   */
  public OnKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendCommand();
    } else if (event.key === 'ArrowUp') {
      const command = this.commandFromHistory(this.index + 1);
      this.command = command.message;
      this.index = command.index;
    } else if (event.key === 'ArrowDown') {
      const command = this.commandFromHistory(this.index - 1);
      this.command = command.message;
      this.index = command.index;
    }
  }

  /**
   * Click event for the send button.
   * @param event Mouse event passed in by the browser.
   */
  public OnSendClick(event: MouseEvent): void {
    this.sendCommand();
  }
}
