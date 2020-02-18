import { Component, Input } from '@angular/core';
import { Config } from 'src/app/services/data/config-data.js';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget.js';
import { Responder } from '../abstract/responder.js';
// @ts-ignore
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
    new Responder(characterConfig.patterns.Coins, (matches) => {
      this.data.coins = parseInt(matches[1], 10);
    }),
    new Responder(characterConfig.patterns.Level, (matches) => {
      this.data.experience.updateStrings(matches[1], '0', matches[2], matches[3]);
    }),
    new Responder(characterConfig.patterns.ClassLevel, (matches) => {
      this.data.setClass(matches[2]);
      this.data.experience.updateStrings(matches[1], matches[3], matches[4], matches[5]);
      this.modifiedStats = this.data.calculatStats();
    }),
    new Responder(characterConfig.patterns.Gear, (matches) => {
      if (matches[3] === 'Armor') {
        this.readingStats = this.data.gear.armor;
        this.data.gear.armor.stats = new Stats(0);
      } else if (matches[3] === 'Weapon') {
        this.readingStats = this.data.gear.weapon;
        this.data.gear.weapon.stats = new Stats(0);
      }
      if (this.readingStats) {
        this.readingStats.name = matches[1];
        this.readingStats.rarity = Rarity[matches[2].toLowerCase()];
      }
    }),
    new Responder(characterConfig.patterns.Id, (matches) => {
      if (this.readingStats) {
        this.readingStats.id = parseInt(matches[1], 10);
      }
    }),
    new Responder(characterConfig.patterns.Stat, (matches) => {
      if (this.readingStats) {
        this.readingStats.stats.updateStat(matches[2], parseInt(matches[1], 10));
        this.modifiedStats = this.data.calculatStats();
      }
    }),
    new Responder(undefined, (matches) => {
      this.readingStats = null;
    })
  );
  public get responders(): Array<Responder> {
    return this.responderArray;
  }
  public get loadCommands(): Array<string> {
    return characterConfig.loadCommands;
  }

  private config: Config;

  /**
   * The character data to display.
   */
  public data = new Character();
  /**
   * The character's stats.
   */
  public modifiedStats = new Stats();
  /**
   * The current item being updated by new messages.
   */
  public readingStats: Item;
  @Input() public ircService: IrcService;
  @Input() public configManager: ConfigManager;

  constructor() { super(); }

  /**
   * Gets the background color of an item based on its rarity.
   * @param item The item to check.
   */
  public colorByRarity(item: Item): string {
    return CharacterWidgetComponent.rarityColors.get(item.rarity);
  }

  /**
   * Gets the text color to use for an item.
   * @param item The item to check.
   */
  public itemTextColor(item: Item): string {
    return item.isSet() ? 'black' : '';
  }

  /**
   * Gets the name of the icon file to load for the current class.
   */
  public getClassIcon(): string {
    return `class-${this.data.class.toLowerCase()}.svg`;
  }
}
