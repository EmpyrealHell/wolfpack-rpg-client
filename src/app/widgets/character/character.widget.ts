import { Component, Input } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { CommandService } from 'src/app/services/command/command-service';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Character } from './model/character';
import { Item, Rarity } from './model/gear';
import { Stats } from './model/stats';

import { EventSubService } from 'src/app/services/eventsub/eventsub.service';

/**
 * Widget used to display character data.
 */
@Component({
    selector: 'app-character-widget',
    templateUrl: './character.widget.html',
    standalone: false
})
export class CharacterWidgetComponent extends AbstractWidgetComponent {
  private static rarityColors = new Map<Rarity, string>([
    [Rarity.none, '#404040'],
    [Rarity.uncommon, '#e4edde'],
    [Rarity.rare, '#dee8ed'],
    [Rarity.epic, '#e6deed'],
  ]);

  /**
   * The character data to display.
   */
  data = new Character();
  /**
   * The character's stats.
   */
  modifiedStats = new Stats();
  /**
   * The current item being updated by new messages.
   */
  readingStats: Item | undefined;

  @Input() eventSubService: EventSubService | undefined;
  @Input() configManager: ConfigManager | undefined;
  @Input() commandService: CommandService | undefined;
  @Input() ripple: MatRipple | undefined;

  constructor() {
    super();
  }

  private handleStats(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'coins') {
      const coins = groups.get('coins');
      if (coins) {
        this.data.coins = Number(coins);
      }
    } else if (id === 'classLevel') {
      groups.get('level');
      this.data.setClass(groups.get('className'));
      this.data.experience.updateStrings(
        groups.get('level'),
        groups.get('prestige'),
        groups.get('experience'),
        groups.get('toNext')
      );
    } else if (id === 'level') {
      this.data.experience.updateStrings(
        groups.get('level'),
        '0',
        groups.get('experience'),
        groups.get('toNext')
      );
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
        newItem.name = sub.get('name') ?? '';
        newItem.description = sub.get('desc') ?? '';
        const isEquipped = sub.get('status') === 'E';
        const qualityString = sub.get('quality');
        newItem.rarity = qualityString
          ? Rarity[qualityString.toLowerCase() as keyof typeof Rarity]
          : Rarity.none;
        newItem.stats.successChance = parseInt(sub.get('success') ?? '0');
        newItem.stats.xpBonus = parseInt(sub.get('xp') ?? '0');
        newItem.stats.wolfcoinBonus = parseInt(sub.get('coin') ?? '0');
        newItem.stats.itemFind = parseInt(sub.get('item') ?? '0');
        newItem.stats.preventDeath = parseInt(sub.get('death') ?? '0');
        if (isEquipped) {
          this.data.gear.armor;
        }
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
  colorByRarity(item: Item): string {
    const color = CharacterWidgetComponent.rarityColors.get(item.rarity);
    return color ? color : '';
  }

  /**
   * Gets the text color to use for an item.
   * @param item The item to check.
   */
  itemTextColor(item: Item): string {
    return item.isSet() ? 'black' : '';
  }

  /**
   * Gets the name of the icon file to load for the current class.
   */
  getClassIcon(): string {
    const charClass = this.data.class
      ? this.data.class
      : Character.defaultClass;
    return `class-${charClass.toLowerCase()}.svg`;
  }
}
