import { Injectable } from '@angular/core';
import { CharacterWidgetComponent } from 'src/app/widgets/character/character.widget';
import { ConsoleWidgetComponent } from 'src/app/widgets/console/console.widget';
import { WidgetItem } from './widget-item';
import { FishingWidgetComponent } from 'src/app/widgets/fishing/fishing.widget';
import { PetWidgetComponent } from 'src/app/widgets/pet/pet.widget';
import { InfoWidgetComponent } from 'src/app/widgets/info/info.widget';
import { InventoryWidgetComponent } from 'src/app/widgets/inventory/inventory.widget';

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
      'character',
      'character'
    ),
    new WidgetItem(
      InventoryWidgetComponent,
      'Inventory',
      'inventory',
      'inventory'
    ),
    new WidgetItem(PetWidgetComponent, 'Pets', 'pets', 'pets'),
    new WidgetItem(FishingWidgetComponent, 'Fishing', 'fishing', 'fishing'),
    // new WidgetItem(null, 'Dungeon', 'dungeon.beta', 'dungeon'),
    // new WidgetItem(null, 'Group', 'group.beta', 'group'),
    // new WidgetItem(null, 'Group Chat', 'group-chat.beta', 'groupchat'),
    new WidgetItem(InfoWidgetComponent, 'Info', 'info', 'info'),
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
