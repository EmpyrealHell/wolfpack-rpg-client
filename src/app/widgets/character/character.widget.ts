import { Component, Input } from '@angular/core';
import { Config } from 'src/app/services/data/config-data.js';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget.js';
import { Responder } from '../abstract/responder.js';
import * as characterConfig from './character.widget.json';
import { Character } from './model/character.js';
import { Item, Rarity } from './model/gear.js';
import { Stats } from './model/stats.js';
import { CommandService } from 'src/app/services/command/command-service.js';

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
    groups: Array<Map<string, string>>
  ): void {
    console.log('Character widget received stats response');
    const data = groups[0];
    if (id === 'coins') {
      const coins = data.get('coins');
      if (coins) {
        this.data.coins = Number(coins);
      }
    } else if (id === 'classLevel') {
      this.data.class = data.get('className');
      this.data.experience.updateStrings(
        data.get('level'),
        data.get('prestige'),
        data.get('experience'),
        data.get('toNext')
      );
    } else if (id === 'level') {
      this.data.experience.updateStrings(
        data.get('level'),
        '0',
        data.get('experience'),
        data.get('toNext')
      );
    }
  }

  private handleInventory(
    name: string,
    id: string,
    groups: Array<Map<string, string>>
  ): void {
    console.log('character widget received inventory response');
    const data = groups[0];
    if (id === 'size') {
      this.readingStats = undefined;
    } else if (id === 'info') {
      const type = data.get('type');
      const equipped = data.get('status') === 'Equipped';
      if (type === 'Armor' && equipped) {
        this.readingStats = this.data.gear.armor;
        this.data.gear.armor.stats = new Stats(0);
      } else if (type === 'Weapon' && equipped) {
        this.readingStats = this.data.gear.weapon;
        this.data.gear.weapon.stats = new Stats(0);
      }
      if (this.readingStats) {
        this.readingStats.name = data.get('name');
        this.readingStats.rarity =
          Rarity[data.get('rarity') as keyof typeof Rarity];
      }
    } else if (id === 'id') {
      if (this.readingStats) {
        this.readingStats.id = Number(data.get('id'));
      }
    } else if (id === 'stat') {
      const stat = data.get('stat');
      if (this.readingStats && this.readingStats.stats && stat) {
        const stats = this.readingStats.stats;
        stats.updateStatByDescription(stat, Number(data.get('value')));
        this.modifiedStats = this.data.calculatStats();
      }
    }
  }

  protected subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void {
    console.log('Character widget subscribing');
    commandService.subscribeToCommand(
      'info',
      'stats',
      'responses',
      'success',
      id,
      this.handleStats
    );
    commandService.subscribeToCommand(
      'inventory',
      'list',
      'responses',
      'success',
      id,
      this.handleInventory
    );
  }

  protected sendInitialCommands(commandService: CommandService): void {
    console.log('Character widget sending initial commands');
    commandService.sendCommand('info', 'stats');
    commandService.sendCommand('inventory', 'list');
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
