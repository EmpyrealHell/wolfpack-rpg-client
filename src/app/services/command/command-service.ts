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
import {
  CommandResponse,
  SubgroupExpression,
  ResponseHistory,
  MatchedResponse,
} from './command-response.js';
import { Utils } from 'src/app/util/utils.js';

/**
 * Defines the structure of a callback method that can be used to subscribe to
 * a message or command response.
 */
export type CommandCallback = (
  name: string,
  id: string,
  groups: Array<Map<string, string>>
) => void;

/**
 * Interface used to pair a key to a matched response outside of a map.
 */
export interface KeyMatchedResponse {
  /**
   * The key of the message.
   */
  key: string;
  /**
   * The object that stores the response to a match.
   */
  value: MatchedResponse;
}

/**
 * Service that sends messages based on the command data json config file.
 */
@Injectable({
  providedIn: 'root',
})
export class CommandService {
  private callbacks = new Map<string, Map<string, CommandCallback>>();
  private messages = new Map<string, Map<string, CommandResponse>>();
  private matches = new Map<string, ResponseHistory>();
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
          this.registerEntry(`${name}.${entryKey}`, 'message', entry);
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
            this.registerEntry(`${name}.${catKey}`, entryKey, entry);
          }
        }
      }
    }
  }

  private registerEntry<T>(name: string, id: string, entry: T): void {
    let map = this.messages.get(name);
    if (!map) {
      map = new Map<string, CommandResponse>();
      this.messages.set(name, map);
    }
    if (typeof entry === 'string') {
      map.set(id, new CommandResponse(entry));
    } else if (typeof entry === 'object') {
      const subgroupEntry = (entry as unknown) as SubgroupExpression;
      const response = new CommandResponse(
        subgroupEntry.response,
        subgroupEntry.subGroups
      );
      map.set(id, response);
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

  private updateHistory(key: string): ResponseHistory | undefined {
    const messages = this.messages.get(key);
    if (!messages) {
      return;
    }
    let history = this.matches.get(key);
    if (!history) {
      history = new ResponseHistory();
      this.matches.set(key, history);
    }
    for (let i = history.lastLine; i < this.ircService.lines.length; i++) {
      const line = this.ircService.lines[i];
      this.handleResponseGroup(line, key, messages, history);
    }
    return history;
  }

  handleResponseGroup(
    message: string,
    key: string,
    responseGroup: Map<string, CommandResponse>,
    history: ResponseHistory,
    callback: CommandCallback | undefined = undefined
  ) {
    for (const [id, pattern] of responseGroup) {
      const match = pattern.response.exec(message);
      if (!match) {
        continue;
      }
      let matches: RegExpExecArray[];
      if (pattern.subGroups) {
        matches = Utils.execAll(pattern.subGroups, message);
      } else {
        matches = [match];
      }
      const groups = matches.map(value => Utils.extractNameCaptures(value));
      history.responses.push(
        new MatchedResponse(id, history.lastLine, [...groups])
      );
      if (callback) {
        callback.call(callback, key, id, groups);
      }
    }
  }

  /**
   * Processes an incoming message, determining if it matches any known
   * patterns and calling their registered listeners with capture groups
   * extracted.
   * @param message The message the client received.
   */
  onIncomingWhisper(message: string): void {
    for (const [subscriber, callbacks] of this.callbacks) {
      for (const [key, callback] of callbacks) {
        let history = this.matches.get(key);
        if (!history) {
          history = new ResponseHistory();
          this.matches.set(key, history);
        }
        history.lastLine = this.ircService.lines
          ? this.ircService.lines.length - 1
          : 0;
        const responseGroup = this.messages.get(key);
        if (!responseGroup) {
          continue;
        }
        this.handleResponseGroup(
          message,
          key,
          responseGroup,
          history,
          callback
        );
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
   * @returns A string representing the command response id.
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
    subscriber: string,
    callback: CommandCallback
  ): string {
    const key = `command.${group}.${command}.response.${result}`;
    let current = this.callbacks.get(subscriber);
    if (!current) {
      current = new Map<string, CommandCallback>();
      this.callbacks.set(subscriber, current);
    }
    current.set(key, callback);
    return key;
  }

  /**
   * Subscribes to a message by its id. This will cause the callback passed in
   * to be called with the capture groups provided when the message is detected
   * in the irc stream.
   * @param group The name of the message group.
   * @param name The name of the individual message.
   * @param callback The method to call when the message is detected.
   * @returns A string representing the message id.
   */
  subscribeToMessage<
    G extends keyof typeof CommandData.messages,
    N extends keyof typeof CommandData.messages[G]
  >(group: G, name: N, subscriber: string, callback: CommandCallback): string {
    const key = `message.${group}.${name}`;
    let current = this.callbacks.get(subscriber);
    if (!current) {
      current = new Map<string, CommandCallback>();
      this.callbacks.set(subscriber, current);
    }
    current.set(key, callback);
    return key;
  }

  /**
   * Iterates over all historical matches for each key that a subscriber is
   * registered for. If the history is not up to date, it will be updated.
   * This will cause the subscriber to respond to every message in the history
   * as if it had been registered the entire time.
   * @param subscriber The subscriber id to replay the history for.
   */
  replayHistory(subscriber: string): void {
    const callbacks = this.callbacks.get(subscriber);
    if (!callbacks) {
      return;
    }
    const matches = new Array<KeyMatchedResponse>();
    for (const [key, callback] of callbacks) {
      const history = this.updateHistory(key);
      if (!history) {
        continue;
      }
      matches.push(...history.responses.map(value => ({ key, value })));
    }
    const sortedMatches = matches.sort(
      (a: KeyMatchedResponse, b: KeyMatchedResponse): number => {
        return a.value.line - b.value.line;
      }
    );

    for (const match of sortedMatches) {
      const callback = callbacks.get(match.key);
      if (callback) {
        callback.call(callback, match.key, match.value.id, match.value.params);
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
   * @returns A string representing the command response id.
   */
  hasCommandBeenSent<
    G extends keyof typeof CommandData.commands,
    C extends keyof typeof CommandData.commands[G]
  >(group: G, command: C): boolean {
    // tslint:disable-next-line: no-any
    const variants = CommandData.commands[group][command] as any;
    const commands: string[] = [];
    if (variants.command) {
      const command = variants.command as string;
      if (command.indexOf('{') === -1) {
        commands.push(variants.command);
      }
    }
    if (variants.alternates) {
      const alternates = variants.alternates as string[];
      commands.push(...alternates.filter(item => item.indexOf('{') === -1));
    }
    const lines = this.ircService.lines;
    const queue = this.ircService.messageQueue.queuedMessages;
    for (const command of commands) {
      if (lines.indexOf(`>> ${command}`) >= 0 && queue.indexOf(command) >= 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Sends a command, as long as that command has not already been sent. This
   * should only be used when initializing a widget, and as such cannot process
   * parameters in a command.
   * @param group The command group.
   * @param command The key of the command.
   */
  sendCommand<
    G extends keyof typeof CommandData.commands,
    C extends keyof typeof CommandData.commands[G]
  >(group: G, command: C): void {
    if (!this.hasCommandBeenSent(group, command)) {
      // tslint:disable-next-line: no-any
      const commandObject = CommandData.commands[group][command] as any;
      if (commandObject.command) {
        const toSend = commandObject.command as string;
        this.ircService.send(toSend);
      }
    }
  }
}
