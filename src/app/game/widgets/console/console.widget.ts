import { Component, OnInit } from '@angular/core';
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
    this.consoleData += `\n &gt; ${message}\n`;
    this.ircService.Send(message);
  }

  public ngOnInit(): void {
    this.ircService.Register(this.onWhisper);
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
