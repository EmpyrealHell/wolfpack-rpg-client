import { Injectable } from '@angular/core';
import { CommandService } from '../command/command-service';
import { Rarity } from 'src/app/widgets/pet/model/pet';
import {
  ItemQuality,
  ItemSlot,
  ItemType,
} from 'src/app/widgets/inventory/model/item';
import { CharacterClass } from 'src/app/widgets/character/model/character';

/**
 * Service containing the feature management system.
 */
@Injectable({
  providedIn: 'root',
})
export class ClientDataService {
  public itemTypes: Map<number, ItemType> = new Map<number, ItemType>();
  public itemSlots: Map<number, ItemSlot> = new Map<number, ItemSlot>();
  public itemQualities: Map<number, ItemQuality> = new Map<
    number,
    ItemQuality
  >();
  public classes: Map<number, CharacterClass> = new Map<
    number,
    CharacterClass
  >();
  public classNames: Map<string, CharacterClass> = new Map<
    string,
    CharacterClass
  >();
  public equippables: Map<number, Array<number>> = new Map<
    number,
    Array<number>
  >();
  public petRarities: Map<number, Rarity> = new Map<number, Rarity>();

  private unescape(s: string): string {
    return s
      .replace('\\p', '|')
      .replace('\\s', ';')
      .replace('\\a', '&')
      .replace('\\\\', '\\');
  }

  private loadQualities(qualities: string[]): void {
    for (let quality of qualities) {
      const parts = quality.split('|');
      if (parts.length === 3) {
        const id = parseInt(parts[0]);
        this.itemQualities.set(
          id,
          new ItemQuality(id, this.unescape(parts[1]), parts[2])
        );
      }
    }
  }

  private loadTypes(types: string[]): void {
    for (let type of types) {
      const parts = type.split('|');
      if (parts.length === 2) {
        const id = parseInt(parts[0]);
        this.itemTypes.set(id, new ItemType(id, this.unescape(parts[1])));
      }
    }
  }

  private loadSlots(slots: string[]): void {
    for (let slot of slots) {
      const parts = slot.split('|');
      if (parts.length === 3) {
        const id = parseInt(parts[0]);
        this.itemSlots.set(
          id,
          new ItemSlot(id, this.unescape(parts[1]), parseInt(parts[2]))
        );
      }
    }
  }

  private parseWithEmpty(s: string): number {
    if (s === '') {
      return 0;
    }
    return parseInt(s);
  }

  private loadClasses(classes: string[]): void {
    for (let charClass of classes) {
      const parts = charClass.split('|');
      if (parts.length === 7) {
        const id = parseInt(parts[0]);
        const charClass = new CharacterClass(
          id,
          this.unescape(parts[1]),
          this.parseWithEmpty(parts[2]),
          this.parseWithEmpty(parts[3]),
          this.parseWithEmpty(parts[4]),
          this.parseWithEmpty(parts[5]),
          this.parseWithEmpty(parts[6])
        );
        this.classes.set(id, charClass);
        this.classNames.set(charClass.name, charClass);
      }
    }
  }

  private loadEquips(equips: string[]): void {
    for (let equip of equips) {
      const pairs = equip.split('|');
      for (let pair of pairs) {
        const parts = pair.split(':');
        if (parts.length === 2) {
          this.equippables.set(
            parseInt(parts[0]),
            parts[1].split(',').map(x => parseInt(x))
          );
        }
      }
    }
  }

  private loadRarities(rarities: string[]): void {
    for (let rarity of rarities) {
      const parts = rarity.split('|');
      if (parts.length === 3) {
        const id = parseInt(parts[0]);
        this.petRarities.set(
          id,
          new Rarity(id, this.unescape(parts[1]), parts[2])
        );
      }
    }
  }

  private handleClientDataUpdate(
    name: string,
    id: string,
    group: Map<string, string>,
    subGroups: Array<Map<string, string>>
  ): void {
    const data = group.get('data');
    if (data) {
      const segments = data.split('&').map(x => x.split(';'));
      if (segments.length === 6) {
        this.loadQualities(segments[0]);
        this.loadTypes(segments[1]);
        this.loadSlots(segments[2]);
        this.loadClasses(segments[3]);
        this.loadEquips(segments[4]);
        this.loadRarities(segments[5]);
      }
    }
  }

  constructor(private commandService: CommandService) {}

  initialize(): void {
    this.commandService.subscribeToCommand(
      'client',
      'data',
      'responses',
      'success',
      'client-data',
      (name, id, groups, subGroups, date) => {
        this.handleClientDataUpdate(name, id, groups, subGroups);
      }
    );
    this.commandService.sendCommand('client', 'data');
  }
}
