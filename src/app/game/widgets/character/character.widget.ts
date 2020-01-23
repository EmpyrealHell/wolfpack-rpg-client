import { Component, OnInit, Input } from '@angular/core';
import { IrcService } from 'src/app/irc/irc.service';
import { ConfigManager } from 'src/app/data/config-manager';
import { WidgetComponent } from '../widget.component';

@Component({
  selector: 'app-character-widget',
  templateUrl: './character.widget.html',
})
export class CharacterWidgetComponent implements WidgetComponent, OnInit {
  public consoleData = '';
  public command = '';

  @Input() public ircService: IrcService;
  @Input() public configManager: ConfigManager;

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
    this.ircService.Register('character-widget', (message) => { this.onWhisper(message); }, true);
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
