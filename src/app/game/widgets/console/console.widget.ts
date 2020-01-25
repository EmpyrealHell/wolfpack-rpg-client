import { Component, Input, OnInit } from '@angular/core';
import { ConfigManager } from 'src/app/data/config-manager';
import { IrcService } from 'src/app/irc/irc.service';
import { WidgetComponent } from '../widget.component';

/**
 * Widget that provides direct access to the communication channel between the
 * authenticated user and the target account.
 */
@Component({
  selector: 'app-console-widget',
  templateUrl: './console.widget.html',
})
export class ConsoleWidgetComponent implements WidgetComponent, OnInit {
  /**
   * The full chat history to render.
   */
  public consoleData = '';
  /**
   * The command to send as input by the user.
   */
  public command = '';

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
    this.consoleData += `\n >> ${message}\n\n`;
    this.ircService.Send(message);
  }

  public ngOnInit(): void {
    this.ircService.Register('console-widget', (message) => { this.onWhisper(message); }, true);
  }

  /**
   * Listen to the key presses to check for enter being pressed.
   * @param event Keyboard event passed in by the browser.
   */
  public OnKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendCommand();
    }
  }

  /**
   * Click event for the send button.
   * @param event Mouse event passed in by the browser.
   */
  public OnSendClick(event: MouseEvent) {
    this.sendCommand();
  }
}
