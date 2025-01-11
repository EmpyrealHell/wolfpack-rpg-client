import { Component, Inject, Input, ViewChild } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Item, ItemQuality, ItemSlot, ItemType } from './model/item';

/**
 * Widget used to display pet data.
 */
@Component({
  selector: 'app-inventory-widget',
  templateUrl: './inventory.widget.html',
  standalone: false,
})
export class InventoryWidgetComponent extends AbstractWidgetComponent {
  name = 'Inventory';

  inventory: Item[] = [];
  selected: Item | undefined;

  constructor(
    public dialog: MatDialog,
    public snackbar: MatSnackBar
  ) {
    super();
  }

  private getItemByName(name: string): Item | undefined {
    const matches = this.inventory.filter(x => x.name === name);
    if (matches && matches.length > 0) {
      return matches[0];
    }
    return undefined;
  }

  private handleInventory(
    id: string,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'compact') {
      for (const sub of subGroups) {
        const newItem = new Item();
        newItem.id = parseInt(sub.get('id') ?? '0');
        newItem.index = this.inventory.length + 1;
        newItem.count = parseInt(sub.get('count') ?? '0');
        newItem.max = parseInt(sub.get('max') ?? '0');
        newItem.name = sub.get('name') ?? '';
        newItem.description = sub.get('desc') ?? '';
        newItem.isEquipped = sub.get('equipped') === 'E';
        const quality = this.clientDataService?.itemQualities.get(
          parseInt(sub.get('quality') ?? '0')
        );
        const slot = this.clientDataService?.itemSlots.get(
          parseInt(sub.get('slot') ?? '0')
        );
        const type = this.clientDataService?.itemTypes.get(
          parseInt(sub.get('type') ?? '0')
        );
        newItem.quality = quality ?? ItemQuality.default;
        newItem.slot = slot ?? ItemSlot.default;
        newItem.type = type ?? ItemType.default;
        newItem.successChance = parseInt(sub.get('success') ?? '0');
        newItem.xpBonus = parseInt(sub.get('xp') ?? '0');
        newItem.coinBonus = parseInt(sub.get('coin') ?? '0');
        newItem.itemFind = parseInt(sub.get('itemFind') ?? '0');
        newItem.preventDeath = parseInt(sub.get('preventDeath') ?? '0');
        this.inventory.push(newItem);
      }
    }
  }

  private handleEquip(id: string, groups: Map<string, string>): void {
    if (id === 'confirmation') {
      const item = this.getItemByName(groups.get('item') ?? '');
      if (item) {
        item.isEquipped = true;
      }
      const toRemove = this.getItemByName(groups.get('unequipped') ?? '');
      if (toRemove) {
        toRemove.isEquipped = false;
      }
    }
  }

  private handleUnequip(id: string, groups: Map<string, string>): void {
    if (id === 'confirmation') {
      const item = this.getItemByName(groups.get('item') ?? '');
      if (item) {
        item.isEquipped = false;
      }
    }
  }

  private handleLoot(isReplay: boolean): void {
    this.inventory = [];
    if (!isReplay) {
      this.commandService?.sendCommand('inventory', 'list');
    }
  }

  protected subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void {
    commandService.subscribeToCommand(
      'inventory',
      'list',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleInventory(id, subGroups);
      }
    );
    commandService.subscribeToCommand(
      'inventory',
      'equip',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        for (let group of groups) {
          console.log(JSON.stringify(group));
        }
        for (let subGroup of subGroups) {
          for (let group of subGroup) {
            console.log(JSON.stringify(group));
          }
        }
        this.handleEquip(id, groups);
      }
    );
    commandService.subscribeToCommand(
      'inventory',
      'unequip',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleUnequip(id, groups);
      }
    );
    commandService.subscribeToMessage(
      'dungeon',
      'completeLoot',
      id,
      (name, id, groups, subGroups, date, isReplay) => {
        this.handleLoot(isReplay ?? false);
      }
    );
  }

  protected sendInitialCommands(commandService: CommandService): void {
    commandService.sendInitialCommand('inventory', 'list');
  }

  public setSelected(item: Item): void {
    this.selected = item;
  }

  public equipItem(): void {
    this.commandService?.sendCommandWithArguments('inventory', 'equip', {
      id: this.selected?.index,
    });
  }

  public unequipItem(): void {
    this.commandService?.sendCommandWithArguments('inventory', 'unequip', {
      id: this.selected?.index,
    });
  }
}
