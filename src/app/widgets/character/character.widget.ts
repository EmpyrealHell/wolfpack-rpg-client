import { Component, Input } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Character, CharacterClass } from './model/character';
import { Item, ItemQuality, ItemSlot, ItemType } from './model/gear';

/**
 * Widget used to display character data.
 */
@Component({
  selector: 'app-character-widget',
  templateUrl: './character.widget.html',
  standalone: false,
})
export class CharacterWidgetComponent extends AbstractWidgetComponent {
  /**
   * The character data to display.
   */
  data = new Character();

  private handleStats(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'compact') {
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
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'compact') {
      for (const sub of subGroups) {
        const newItem = new Item();
        newItem.id = parseInt(sub.get('id') ?? '0');
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
      (name, id, groups, subGroups, date) =>
        this.handleStats(name, id, groups, subGroups, date)
    );
    commandService.subscribeToCommand(
      'inventory',
      'list',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) =>
        this.handleInventory(name, id, groups, subGroups, date)
    );
  }

  protected sendInitialCommands(commandService: CommandService): void {
    commandService.sendInitialCommand('info', 'stats');
    commandService.sendInitialCommand('inventory', 'list');
  }

  /**
   * Gets the background color of an item based on its rarity.
   * @param item The item to check.
   */
  getShadowColor(color: string): string {
    const red = parseInt(color.substring(1, 3), 16) / 2;
    const green = parseInt(color.substring(3, 5), 16) / 2;
    const blue = parseInt(color.substring(5, 7), 16) / 2;
    return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
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

  private getEquipped(): Item[] {
    return this.data.inventory.filter(x => x.isEquipped);
  }

  private sum(arr: number[]): number {
    return arr.reduce((x, acc) => x + acc);
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
