import { Component, Input } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Character } from './model/character';
import { Item, Rarity } from './model/gear';
import { Stats } from './model/stats';

/**
 * Widget used to display character data.
 */
@Component({
  selector: 'app-character-widget',
  templateUrl: './character.widget.html',
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

  @Input() ircService: IrcService | undefined;
  @Input() configManager: ConfigManager | undefined;
  @Input() commandService: CommandService | undefined;

  constructor() {
    super();
  }

  private handleStats(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>
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
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'size') {
      this.readingStats = undefined;
    } else if (id === 'info') {
      const type = groups.get('type');
      const equipped = groups.get('status') === 'Equipped';
      if (type === 'Armor' && equipped) {
        this.readingStats = this.data.gear.armor;
        this.data.gear.armor.stats = new Stats(0);
      } else if (type === 'Weapon' && equipped) {
        this.readingStats = this.data.gear.weapon;
        this.data.gear.weapon.stats = new Stats(0);
      }
      if (this.readingStats) {
        const name = groups.get('name');
        this.readingStats.name = name ? name : '';
        const rarityString = groups.get('rarity');
        this.readingStats.rarity = rarityString
          ? Rarity[rarityString.toLowerCase() as keyof typeof Rarity]
          : Rarity.none;
      }
    } else if (id === 'id') {
      if (this.readingStats) {
        this.readingStats.id = Number(groups.get('id'));
      }
    } else if (id === 'stat') {
      const stat = groups.get('stat');
      if (this.readingStats && this.readingStats.stats && stat) {
        const stats = this.readingStats.stats;
        stats.updateStatByDescription(stat, Number(groups.get('value')));
        this.modifiedStats = this.data.calculatStats();
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
      (name, id, groups, subGroups) =>
        this.handleStats(name, id, groups, subGroups)
    );
    commandService.subscribeToCommand(
      'inventory',
      'list',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups) =>
        this.handleInventory(name, id, groups, subGroups)
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
