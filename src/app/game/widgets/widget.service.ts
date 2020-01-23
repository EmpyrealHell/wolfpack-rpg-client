import { Injectable } from '@angular/core';
import { WidgetComponent } from './widget.component';
import { ConsoleWidgetComponent } from './console/console.widget';
import { WidgetItem } from './widget-item';
import { IrcService } from 'src/app/irc/irc.service';
import { ConfigManager } from 'src/app/data/config-manager';
import { CharacterWidgetComponent } from './character/character.widget';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  constructor(private ircService: IrcService, private configManager: ConfigManager) { }

  public getWidgets(): Array<WidgetItem> {
    return [
      new WidgetItem(ConsoleWidgetComponent, 'Console'),
      new WidgetItem(CharacterWidgetComponent, 'Character'),
    ];
  }
}
