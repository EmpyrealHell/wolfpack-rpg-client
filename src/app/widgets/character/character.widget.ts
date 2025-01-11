import { Component, Input } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Character, CharacterClass } from './model/character';
import { Item, ItemQuality, ItemSlot, ItemType } from '../inventory/model/item';

/**
 * Widget used to display character data.
 */
@Component({
  selector: 'app-character-widget',
  templateUrl: './character.widget.html',
  standalone: false,
})
export class CharacterWidgetComponent extends AbstractWidgetComponent {
  name = 'Character';
  /**
   * The character data to display.
   */
  data = new Character();

  private handleStats(id: string, groups: Map<string, string>): void {
    if (id === 'compact') {
      this.data.subscriber = groups.get('sub') === 'S';
      this.data.level = parseInt(groups.get('level') ?? '0');
      this.data.prestige = parseInt(groups.get('prestige') ?? '0');
      this.data.class =
        this.clientDataService?.classNames.get(groups.get('className') ?? '') ??
        CharacterClass.default;
      this.data.experience = parseInt(groups.get('xp') ?? '0');
      this.data.coins = parseInt(groups.get('currency') ?? '0');
    }
  }

  private handleInventory(
    id: string,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'compact') {
      for (const sub of subGroups) {
        const newItem = new Item();
        newItem.id = parseInt(sub.get('id') ?? '0');
        newItem.index = this.data.inventory.length + 1;
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
        this.data.inventory.push(newItem);
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

  protected subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void {
    commandService.subscribeToCommand(
      'info',
      'stats',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleStats(id, groups);
      }
    );
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
    /*
     * TODO: Update all of these with proper handlers to update the coin/xp amount
     *   For respec and select class, need to create a class selection dialog
     */
    commandService.subscribeToCommand(
      'shop',
      'respec',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToCommand(
      'shop',
      'respec',
      'responses',
      'pending',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToCommand(
      'shop',
      'respec',
      'responses',
      'error',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToCommand(
      'shop',
      'selectClass',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToCommand(
      'shop',
      'stats',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToCommand(
      'pets',
      'feed',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToCommand(
      'shop',
      'gloat',
      'responses',
      'public',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToCommand(
      'shop',
      'gloat',
      'responses',
      'public',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToCommand(
      'shop',
      'gloatFish',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToCommand(
      'shop',
      'gloatPet',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToMessage(
      'player',
      'awards',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToMessage(
      'player',
      'levelUp',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToMessage(
      'player',
      'prestige',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToMessage(
      'player',
      'selectClass',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToMessage(
      'dungeon',
      'completeAwards',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToMessage(
      'dungeon',
      'death',
      id,
      (name, id, groups, subGroups, date) => {}
    );
    commandService.subscribeToMessage(
      'dungeon',
      'start',
      id,
      (name, id, groups, subGroups, date) => {}
    );
  }

  protected sendInitialCommands(commandService: CommandService): void {
    commandService.sendInitialCommand('info', 'stats');
    commandService.sendInitialCommand('inventory', 'list');
  }

  getSlots(): ItemSlot[] {
    const allSlots = this.data.inventory.map(x => x.slot);
    return allSlots.filter((x, i) => allSlots.indexOf(x) === i);
  }

  getItemsInSlot(slot: ItemSlot): Item[] {
    return this.data.inventory.filter(
      x => x.slot.id === slot.id && x.isEquipped
    );
  }

  getItemByName(name: string): Item | undefined {
    const matches = this.data.inventory.filter(x => x.name === name);
    if (matches && matches.length > 0) {
      return matches[0];
    }
    return undefined;
  }

  private getEquipped(): Item[] {
    return this.data.inventory.filter(x => x.isEquipped);
  }

  private sum(arr: number[]): number {
    return arr.reduce((x, acc) => x + acc, 0);
  }

  getSuccessChance(): number {
    const gear = this.sum(this.getEquipped().map(x => x.successChance));
    return this.data.class.successChance + gear;
  }

  getXpBonus(): number {
    const gear = this.sum(this.getEquipped().map(x => x.xpBonus));
    return this.data.class.xpBonus + gear;
  }

  getCoinBonus(): number {
    const gear = this.sum(this.getEquipped().map(x => x.coinBonus));
    return this.data.class.coinBonus + gear;
  }

  getItemFind(): number {
    const gear = this.sum(this.getEquipped().map(x => x.itemFind));
    return this.data.class.itemFind + gear;
  }

  getPreventDeath(): number {
    const gear = this.sum(this.getEquipped().map(x => x.preventDeath));
    return this.data.class.preventDeath + gear;
  }
}
