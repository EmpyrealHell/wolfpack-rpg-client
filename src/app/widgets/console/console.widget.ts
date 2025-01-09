import { Component, Input, OnInit } from '@angular/core';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { WidgetComponent } from 'src/app/components/widget-factory/widget.component';
import { CommandService } from 'src/app/services/command/command-service';
import { MatRipple } from '@angular/material/core';
import {
  EventSubService,
  Message,
} from 'src/app/services/eventsub/eventsub.service';
import { ClientDataService } from 'src/app/services/client-data/client-data-service';

/**
 * Widget that provides direct access to the communication channel between the
 * authenticated user and the target account.
 */
@Component({
  selector: 'app-console-widget',
  templateUrl: './console.widget.html',
  standalone: false,
})
export class ConsoleWidgetComponent implements WidgetComponent {
  private static maxHistory = 100;
  private index = -1;

  /**
   * The full chat history to render.
   */
  consoleData = '';
  /**
   * The command to send as input by the user.
   */
  command = '';
  /**
   * The name of the widget;
   */
  name = '';

  /**
   * Reference to the ClientData service.
   */
  @Input()
  clientDataService: ClientDataService | undefined;
  /**
   * Reference to the EventSub chat service.
   */
  @Input()
  eventSubService: EventSubService | undefined;
  /**
   * Reference to the user's config data manager.
   */
  @Input()
  configManager: ConfigManager | undefined;
  /**
   * Reference to the command service.
   */
  @Input()
  commandService: CommandService | undefined;
  /**
   * Reference to the material ripple;
   */
  @Input()
  ripple: MatRipple | undefined;

  /**
   * Whether the EventSub service is connected.
   */
  get isConnected(): boolean {
    if (!this.eventSubService) {
      return false;
    }
    return this.eventSubService.isConnected;
  }

  private onWhisper(message: Message): void {
    if (message.whisper) {
      const newLine = this.consoleData.length === 0 ? '' : '\n';
      const prefixedMessage = message.self
        ? `>> ${message.text}`
        : message.text;
      const fullMessage = message.self
        ? `${newLine}${prefixedMessage}`
        : prefixedMessage;
      this.consoleData += `${fullMessage}\n`;
    }
  }

  private sendCommand(): void {
    if (this.eventSubService && this.configManager) {
      const message = this.command;
      this.command = '';
      this.eventSubService.send(message);

      const history = this.configManager.getConfig().history;
      history.push(message);
      if (history.length > ConsoleWidgetComponent.maxHistory) {
        history.splice(0, 1);
      }
      this.configManager.save();
      this.index = -1;
    }
  }

  private commandFromHistory(index: number): {
    message: string;
    index: number;
  } {
    if (!this.configManager) {
      return {
        message: '',
        index,
      };
    }
    const history = this.configManager.getConfig().history;
    const clampedIndex = Math.max(Math.min(index, history.length - 1), -1);
    if (clampedIndex < 0) {
      return {
        message: '',
        index: -1,
      };
    } else {
      return {
        message: history[history.length - clampedIndex - 1],
        index: clampedIndex,
      };
    }
  }

  onActivate(): void {
    if (this.eventSubService) {
      this.eventSubService.register(
        'console-widget',
        message => {
          this.onWhisper(message);
        },
        true
      );
      this.consoleData = '';
      for (const line of this.eventSubService.lines) {
        this.onWhisper(line);
      }
    }
  }

  /**
   * Listen to the key presses to check for enter being pressed.
   * @param event Keyboard event passed in by the browser.
   */
  onKeyUp(event: KeyboardEvent): void {
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
  onSendClick(event: MouseEvent): void {
    this.sendCommand();
  }
}
