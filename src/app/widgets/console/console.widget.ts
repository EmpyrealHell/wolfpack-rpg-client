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
    this.ircService.Send(message);
  }

  public onActivate(): void {
    this.ircService.Register('console-widget', (message) => { this.onWhisper(message); }, true);
    this.consoleData = this.ircService.GetHistory();
  }

  /**
   * Listen to the key presses to check for enter being pressed.
   * @param event Keyboard event passed in by the browser.
   */
  public OnKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendCommand();
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
