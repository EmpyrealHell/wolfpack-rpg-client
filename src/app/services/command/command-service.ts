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
import { CommandResponse, SubgroupExpression } from './command-response.js';
import { Utils } from 'src/app/util/utils.js';

export type CommandCallback = (
  name: string,
  id: string,
  groups: Array<Map<string, string>>
) => void;

/**
 * Service that sends messages based on the command data json config file.
 */
@Injectable({
  providedIn: 'root',
})
export class CommandService {
  private callbacks = new Map<string, CommandCallback[]>();
  private messages = new Map<string, CommandResponse>();
  /**
   * Object containing mapped methods for each chat command.
   */
  chat: ChatCommands;
  /**
   * Object containing mapped methods for each dungeon command.
   */
  dungeon: DungeonCommands;
  /**
   * Object containing mapped methods for each fishing command.
   */
  fishing: FishingCommands;
  /**
   * Object containing mapped methods for each info command.
   */
  info: InfoCommands;
  /**
   * Object containing mapped methods for each inventory command.
   */
  inventory: InventoryCommands;
  /**
   * Object containing mapped methods for each party command.
   */
  party: PartyCommands;
  /**
   * Object containing mapped methods for each pending command.
   */
  pending: PendingCommands;
  /**
   * Object containing mapped methods for each pets command.
   */
  pets: PetsCommands;
  /**
   * Object containing mapped methods for each shop command.
   */
  shop: ShopCommands;

  get messageList(): string[] {
    return [...this.messages.keys()];
  }

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
    // tslint:disable-next-line: no-any
    const responses = (command as any)['responses'];
    for (const catKey in responses) {
      if (responses[catKey]) {
        const category = responses[catKey];
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

  /**
   * Processes an incoming message, determining if it matches any known
   * patterns and calling their registered listeners with capture groups
   * extracted.
   * @param message The message the client received.
   */
  onIncomingWhisper(message: string): void {
    for (const [key, value] of this.callbacks) {
      const pattern = this.messages.get(key);
      if (pattern) {
        const match = pattern.response.exec(message);
        if (match) {
          let matches: RegExpExecArray[];
          if (pattern.subGroups) {
            matches = Utils.execAll(pattern.subGroups, message);
          } else {
            matches = [match];
          }
          const groups = matches.map(value => Utils.extractNameCaptures(value));
          value.forEach(callback => callback.call(callback, key, '', groups));
        }
      }
    }
  }

  /**
   * Subscribes to a command by its id. This will cause the callback passed in
   * to be called with the capture groups provided when the command response
   * category is detected in the irc stream.
   * @param group The name of the command group.
   * @param command The name of the individual command.
   * @param responses Must be responses to maintain type safety.
   * @param result The type of result (success, failure, etc.).
   * @param callback The method to call when the command response is detected.
   */
  subscribeToCommand<
    G extends keyof typeof CommandData.commands,
    C extends keyof typeof CommandData.commands[G],
    R extends keyof typeof CommandData.commands[G][C],
    S extends keyof typeof CommandData.commands[G][C][R]
  >(
    group: G,
    command: C,
    responses: R,
    result: S,
    callback: CommandCallback
  ): void {
    const key = `command.${group}.${command}.response.${result}`;
    let current = this.callbacks.get(key);
    if (!current) {
      current = [];
      this.callbacks.set(key, current);
    }
    current.push(callback);
  }

  /**
   * Subscribes to a message by its id. This will cause the callback passed in
   * to be called with the capture groups provided when the message is detected
   * in the irc stream.
   * @param group The name of the message group.
   * @param name The name of the individual message.
   * @param callback The method to call when the message is detected.
   */
  subscribeToMessage<
    G extends keyof typeof CommandData.messages,
    N extends keyof typeof CommandData.messages[G]
  >(group: G, name: N, callback: CommandCallback): void {
    const key = `message.${group}.${name}`;
    let current = this.callbacks.get(key);
    if (!current) {
      current = [];
      this.callbacks.set(key, current);
    }
    current.push(callback);
  }
}
