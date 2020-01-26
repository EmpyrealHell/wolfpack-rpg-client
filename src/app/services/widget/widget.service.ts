import { Injectable } from '@angular/core';
import { CharacterWidgetComponent } from 'src/app/widgets/character/character.widget';
import { ConsoleWidgetComponent } from 'src/app/widgets/console/console.widget';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
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
  );

  constructor(private ircService: IrcService, private configManager: ConfigManager) { }

  /**
   * Returns a collection of all available widgets.
   */
  public getWidgets(): Array<WidgetItem> {
    return WidgetService.widgets;
  }
}
