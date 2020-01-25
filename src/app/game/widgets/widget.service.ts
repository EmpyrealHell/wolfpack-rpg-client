import { Injectable } from '@angular/core';
import { ConfigManager } from 'src/app/data/config-manager';
import { IrcService } from 'src/app/irc/irc.service';
import { CharacterWidgetComponent } from './character/character.widget';
import { ConsoleWidgetComponent } from './console/console.widget';
import { WidgetItem } from './widget-item';

/**
 * Service containing the list of all available widgets.
 */
@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  private static widgets = new Array<WidgetItem>(
    new WidgetItem(ConsoleWidgetComponent, 'Console'),
    new WidgetItem(CharacterWidgetComponent, 'Character'),
    new WidgetItem(CharacterWidgetComponent, 'Character2'),
    new WidgetItem(CharacterWidgetComponent, 'Character3'),
    new WidgetItem(CharacterWidgetComponent, 'Character4'),
    new WidgetItem(CharacterWidgetComponent, 'Character5'),
    new WidgetItem(CharacterWidgetComponent, 'Character6'),
    new WidgetItem(CharacterWidgetComponent, 'Character7'),
    new WidgetItem(CharacterWidgetComponent, 'Character8'),
  );

  constructor(private ircService: IrcService, private configManager: ConfigManager) { }

  /**
   * Returns a collection of all available widgets.
   */
  public getWidgets(): Array<WidgetItem> {
    return WidgetService.widgets;
  }
}
