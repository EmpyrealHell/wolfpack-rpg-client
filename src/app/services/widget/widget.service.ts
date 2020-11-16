import { Injectable } from '@angular/core';
import { CharacterWidgetComponent } from 'src/app/widgets/character/character.widget';
import { ConsoleWidgetComponent } from 'src/app/widgets/console/console.widget';
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
    new WidgetItem(
      CharacterWidgetComponent,
      'Character',
      'character.beta',
      'character'
    ),
    new WidgetItem(null, 'Inventory', 'inventory.beta', 'inventory'),
    new WidgetItem(null, 'Pets', 'pets.beta', 'pets'),
    new WidgetItem(
      FishingWidgetComponent,
      'Fishing',
      'fishing.beta',
      'fishing'
    ),
    new WidgetItem(null, 'Fishing', 'fishing-tournament.beta', 'fishing'),
    new WidgetItem(null, 'Dungeon', 'dungeon.beta', 'dungeon'),
    new WidgetItem(null, 'Group', 'group.beta', 'group'),
    new WidgetItem(null, 'Group Chat', 'group-chat.beta', 'groupchat'),
    new WidgetItem(null, 'Shop', 'shop.beta', 'shop'),
    new WidgetItem(null, 'Info', 'info.beta', 'info'),
    new WidgetItem(ConsoleWidgetComponent, 'Console', 'console', 'console')
  );

  constructor() {}

  /**
   * Returns a collection of all available widgets.
   */
  getWidgets(): WidgetItem[] {
    return WidgetService.widgets;
  }
}
