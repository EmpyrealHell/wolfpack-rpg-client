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
    [Rarity.epic, '#e6deed']
  ]);

  private responderArray = new Array<Responder>(
    new Responder(characterConfig.patterns.coins, (matches) => {
      this.data.coins = Number(matches[1]);
    }),
    new Responder(characterConfig.patterns.level, (matches) => {
      this.data.experience.updateStrings(matches[1], '0', matches[2], matches[3]);
    }),
    new Responder(characterConfig.patterns.classLevel, (matches) => {
      this.data.setClass(matches[2]);
      this.data.experience.updateStrings(matches[1], matches[3], matches[4], matches[5]);
      this.modifiedStats = this.data.calculatStats();
    }),
    new Responder(characterConfig.patterns.gear, (matches) => {
      if (matches[3] === 'Armor') {
        this.readingStats = this.data.gear.armor;
        this.data.gear.armor.stats = new Stats(0);
      } else if (matches[3] === 'Weapon') {
        this.readingStats = this.data.gear.weapon;
        this.data.gear.weapon.stats = new Stats(0);
      }
      if (this.readingStats) {
        this.readingStats.name = matches[1];
        const rarity = matches[2].toLowerCase();
        this.readingStats.rarity = Rarity[rarity as keyof typeof Rarity];
      }
    }),
    new Responder(characterConfig.patterns.id, (matches) => {
      if (this.readingStats) {
        this.readingStats.id = Number(matches[1]);
      }
    }),
    new Responder(characterConfig.patterns.stat, (matches) => {
      if (this.readingStats) {
        this.readingStats.stats.updateStatByDescription(matches[2], Number(matches[1]));
        this.modifiedStats = this.data.calculatStats();
      }
    }),
    new Responder(null, (matches) => {
      this.readingStats = null;
    })
  );

  get responders(): Responder[] {
    return this.responderArray;
  }

  get loadCommands(): string[] {
    return characterConfig.loadCommands;
  }

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
  readingStats: Item | null = null;

  @Input() ircService: IrcService | null = null;
  @Input() configManager: ConfigManager | null = null;

  constructor() { super(); }

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
    return `class-${this.data.class.toLowerCase()}.svg`;
  }
}
