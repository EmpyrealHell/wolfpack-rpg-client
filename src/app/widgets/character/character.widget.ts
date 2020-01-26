import { Component, Input, OnInit } from '@angular/core';
import { WidgetComponent } from 'src/app/components/widget-factory/widget.component';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import * as characterConfig from './character.widget.json';
import { Character } from './model/character.js';
import { Item, Rarity } from './model/gear.js';
import { Stats } from './model/stats.js';

/**
 * Definition for callback function used in response listeners.
 */
export type ResponseCallback = (matches: Array<string>) => void;
/**
 * Provides functionality to listen for whispers that match a pattern and
 * execute a callback function when it finds a match.
 */
export class ResponseListener {
  public pattern: RegExp;
  public global: RegExp;
  constructor(pattern: string, public callback: ResponseCallback) {
    this.pattern = new RegExp(pattern, 'mi');
    this.global = new RegExp(pattern, 'gmi');
  }
}

/**
 * Widget used to display character data.
 */
@Component({
  selector: 'app-character-widget',
  templateUrl: './character.widget.html',
})
export class CharacterWidgetComponent implements WidgetComponent, OnInit {
  private static rarityColors = new Map<Rarity, string>([
    [Rarity.none, '#404040'],
    [Rarity.uncommon, '#e4edde'],
    [Rarity.rare, '#dee8ed'],
    [Rarity.epic, '#e6deed']
  ]);

  private responses = new Array<ResponseListener>(
    new ResponseListener(characterConfig.patterns.Coins, (matches) => {
      this.data.coins = parseInt(matches[1], 10);
    }),
    new ResponseListener(characterConfig.patterns.Level, (matches) => {
      this.data.experience.updateStrings(matches[1], '0', matches[2], matches[3]);
    }),
    new ResponseListener(characterConfig.patterns.ClassLevel, (matches) => {
      this.data.setClass(matches[2]);
      this.data.experience.updateStrings(matches[1], matches[3], matches[4], matches[5]);
      this.modifiedStats = this.data.calculatStats();
    }),
    new ResponseListener(characterConfig.patterns.Gear, (matches) => {
      if (matches[3] === 'Armor') {
        this.readingStats = this.data.gear.armor;
      } else if (matches[3] === 'Weapon') {
        this.readingStats = this.data.gear.weapon;
      } else {
        this.readingStats = null;
      }
      if (this.readingStats) {
        this.readingStats.name = matches[1];
        this.readingStats.rarity = Rarity[matches[2].toLowerCase()];
      }
    }),
    new ResponseListener(characterConfig.patterns.Stat, (matches) => {
      if (this.readingStats) {
        this.readingStats.stats.updateStat(matches[2], parseInt(matches[1], 10));
        this.modifiedStats = this.data.calculatStats();
      }
    })
  );

  private data = new Character();
  private modifiedStats = new Stats();
  private readingStats: Item;
  @Input() public ircService: IrcService;
  @Input() public configManager: ConfigManager;

  constructor() { }

  private onWhisper(message: string): void {
    for (const response of this.responses) {
      const match = message.match(response.pattern);
      if (match) {
        response.callback.call(response.callback, match);
      }
    }
  }

  private colorByRarity(item: Item): string {
    return CharacterWidgetComponent.rarityColors.get(item.rarity);
  }

  private itemTextColor(item: Item): string {
    return item.isSet() ? 'black' : '';
  }

  public ngOnInit(): void {
    this.ircService.Register('character-widget', (message) => { this.onWhisper(message); }, true);
    const history = this.ircService.GetHistory();
    for (const response of this.responses) {
      const match = history.match(response.global);
      if (match) {
        const groups = match[match.length - 1].match(response.pattern);
        response.callback.call(response.callback, groups);
      }
    }
    for (const command of characterConfig.loadCommands) {
      if (history.indexOf(`>> ${command}`) === -1) {
        this.ircService.Send(command);
      }
    }
  }
}
