import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IrcService } from 'src/app/irc/irc.service';

@Component({
  selector: 'app-console-widget',
  templateUrl: './console.widget.html',
})
export class ConsoleWidgetComponent implements OnInit {
  public consoleData = '';
  public command = '';

  constructor(public ircService: IrcService) { }

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

  public OnKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendCommand();
    }
  }

  public OnSendClick(event: MouseEvent) {
    this.sendCommand();
  }
}
