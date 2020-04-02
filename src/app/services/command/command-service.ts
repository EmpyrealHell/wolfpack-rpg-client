import { Injectable } from '@angular/core';
import { IrcService } from '../irc/irc.service.js';
import { ChatCommands } from './chat-commands.js';
import { DungeonCommands } from './dungeon-commands.js';
import { FishingCommands } from './fishing-commands.js';
import { InfoCommands } from './info-commands.js';
import { InventoryCommands } from './inventory-commands.js';
import { PartyCommands } from './party-commands.js';
import { PendingCommands } from './pending-commands.js';
import { PetsCommands } from './pets-commands.js';
import { ShopCommands } from './shop-commands.js';
import * as CommandData from './command-data.json';

/**
 * Service that sends messages based on the command data json config file.
 */
@Injectable({
  providedIn: 'root',
})
export class CommandService {
  private messages = new Map<string, CommandResponse>();
  chat: ChatCommands;
  dungeon: DungeonCommands;
  fishing: FishingCommands;
  info: InfoCommands;
  inventory: InventoryCommands;
  party: PartyCommands;
  pending: PendingCommands;
  pets: PetsCommands;
  shop: ShopCommands;

  constructor(private ircService: IrcService) {
    this.chat = new ChatCommands(ircService);
    this.dungeon = new DungeonCommands(ircService);
    this.fishing = new FishingCommands(ircService);
    this.info = new InfoCommands(ircService);
    this.inventory = new InventoryCommands(ircService);
    this.party = new PartyCommands(ircService);
    this.pending = new PendingCommands(ircService);
    this.pets = new PetsCommands(ircService);
    this.shop = new ShopCommands(ircService);

    this.registerResponses();
    this.registerMessages();
    this.ircService.register('command-service', this.onIncomingWhisper, true);
  }

  private registerContainer<T>(
    name: string,
    container: T,
    isCommand = false
  ): void {
    for (const groupKey in container) {
      if (container[groupKey]) {
        const group = container[groupKey];
        this.registerGroup(`${name}.${groupKey}`, group, isCommand);
      }
    }
  }

  private registerGroup<T>(name: string, group: T, isCommand: boolean): void {
    for (const entryKey in group) {
      if (group[entryKey]) {
        const entry = group[entryKey];
        if (isCommand) {
          this.registerCommand(`${name}.${entryKey}`, entry);
        } else {
          this.registerEntry(`${name}.${entryKey}`, entry);
        }
      }
    }
  }

  private registerCommand<T>(name: string, command: T): void {
    for (const catKey in command) {
      if (command[catKey]) {
        const category = command[catKey];
        for (const entryKey in category) {
          if (category[entryKey]) {
            const entry = category[entryKey];
            this.registerEntry(`${name}.${catKey}.${entryKey}`, entry);
          }
        }
      }
    }
  }

  private registerEntry<T>(name: string, entry: T): void {
    if (typeof entry === 'string') {
      this.messages.set(name, new CommandResponse(entry));
    } else if (typeof entry === 'object') {
      const subgroupEntry = (entry as unknown) as SubgroupExpression;
      const response = new CommandResponse(
        subgroupEntry.response,
        subgroupEntry.subGroups
      );
      this.messages.set(name, response);
    }
  }

  private registerResponses(): void {
    // tslint:disable-next-line: no-any
    const commands = CommandData.commands as any;
    this.registerContainer('command', commands, true);
  }

  private registerMessages(): void {
    // tslint:disable-next-line: no-any
    const messages = CommandData.messages as any;
    this.registerContainer('message', messages);
  }

  onIncomingWhisper(message: string): void {
    for (const [key, value] of this.messages) {
      if (value.response.test(message)) {
        if (value.subGroups) {
          const match = value.subGroups.exec(message);
          console.log(match);
        } else {
          const match = value.response.exec(message);
          console.log(match);
        }
      }
    }
  }
}

export class CommandResponse {
  response: RegExp;
  subGroups: RegExp | undefined;

  constructor(response: string, subGroups: string | undefined = undefined) {
    this.response = new RegExp(response).compile();
    if (subGroups) {
      this.subGroups = new RegExp(subGroups).compile();
    }
  }
}

export interface SubgroupExpression {
  response: string;
  subGroups: string;
}
