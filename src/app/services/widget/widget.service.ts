import { Injectable } from '@angular/core';
import { CharacterWidgetComponent } from 'src/app/widgets/character/character.widget';
import { ConsoleWidgetComponent } from 'src/app/widgets/console/console.widget';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { WidgetItem } from './widget-item';
import { FishingWidgetComponent } from 'src/app/widgets/fishing/fishing.widget';

/**
 * Service containing the list of all available widgets.
 */
@Injectable({
  providedIn: 'root',
})
export class WidgetService {
  private static widgets = new Array<WidgetItem>(
    new WidgetItem(CharacterWidgetComponent, 'Character'),
    new WidgetItem(null, 'Inventory'),
    new WidgetItem(null, 'Pets'),
    new WidgetItem(FishingWidgetComponent, 'Fishing'),
    new WidgetItem(null, null),
    new WidgetItem(null, 'Dungeon'),
    new WidgetItem(null, 'Group'),
    new WidgetItem(null, 'Group Chat'),
    new WidgetItem(null, null),
    new WidgetItem(null, 'Shop'),
    new WidgetItem(null, 'Info'),
    new WidgetItem(ConsoleWidgetComponent, 'Console')
  );

  constructor(
    private ircService: IrcService,
    private configManager: ConfigManager
  ) {}

  /**
   * Returns a collection of all available widgets.
   */
  getWidgets(): WidgetItem[] {
    return WidgetService.widgets;
  }
}
