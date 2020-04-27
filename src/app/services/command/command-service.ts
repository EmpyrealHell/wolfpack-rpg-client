import { Injectable } from '@angular/core';
import { Utils } from 'src/app/util/utils.js';
import { IrcService } from '../irc/irc.service.js';
import { ChatCommands } from './chat-commands.js';
import * as CommandData from './command-data.json';
import { CommandLoader } from './command-loader.js';
import {
  CommandResponse,
  MatchedResponse,
  ResponseHistory,
} from './command-response.js';
import { DungeonCommands } from './dungeon-commands.js';
import { FishingCommands } from './fishing-commands.js';
import { InfoCommands } from './info-commands.js';
import { InventoryCommands } from './inventory-commands.js';
import { PartyCommands } from './party-commands.js';
import { PendingCommands } from './pending-commands.js';
import { PetsCommands } from './pets-commands.js';
import { ShopCommands } from './shop-commands.js';

/**
 * Defines the structure of a callback method that can be used to subscribe to
 * a message or command response.
 */
export type CommandCallback = (
  name: string,
  id: string,
  groups: Map<string, string>,
  subGroups: Array<Map<string, string>>
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
  private matches = new Map<string, ResponseHistory>();
  private static instance: CommandService | undefined = undefined;

  get instance(): CommandService {
    if (!CommandService.instance) {
      CommandService.instance = this;
      this.initialize();
    }
    return CommandService.instance;
  }

  /**
   * Object that loads and maintains the list of all possible command keys.
   */
  messages = new CommandLoader();
  /**
   * Object containing mapped methods for each chat command.
   */
  chat: ChatCommands | undefined;
  /**
   * Object containing mapped methods for each dungeon command.
   */
  dungeon: DungeonCommands | undefined;
  /**
   * Object containing mapped methods for each fishing command.
   */
  fishing: FishingCommands | undefined;
  /**
   * Object containing mapped methods for each info command.
   */
  info: InfoCommands | undefined;
  /**
   * Object containing mapped methods for each inventory command.
   */
  inventory: InventoryCommands | undefined;
  /**
   * Object containing mapped methods for each party command.
   */
  party: PartyCommands | undefined;
  /**
   * Object containing mapped methods for each pending command.
   */
  pending: PendingCommands | undefined;
  /**
   * Object containing mapped methods for each pets command.
   */
  pets: PetsCommands | undefined;
  /**
   * Object containing mapped methods for each shop command.
   */
  shop: ShopCommands | undefined;

  constructor(private ircService: IrcService) {}

  initialize(): void {
    console.log('Command service initialized');
    this.chat = new ChatCommands(this.ircService);
    this.dungeon = new DungeonCommands(this.ircService);
    this.fishing = new FishingCommands(this.ircService);
    this.info = new InfoCommands(this.ircService);
    this.inventory = new InventoryCommands(this.ircService);
    this.party = new PartyCommands(this.ircService);
    this.pending = new PendingCommands(this.ircService);
    this.pets = new PetsCommands(this.ircService);
    this.shop = new ShopCommands(this.ircService);

    this.messages = new CommandLoader();
    this.messages.load();
    this.ircService.register('command-service', this.onIncomingWhisper, true);
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

  private handleResponseGroup(
    message: string,
    key: string,
    responseGroup: Map<string, CommandResponse>,
    history: ResponseHistory,
    callback: CommandCallback | undefined = undefined
  ) {
    for (const [id, pattern] of responseGroup) {
      const match = pattern.response.pattern.exec(message);
      if (!match) {
        continue;
      }
      const matchMap = new Map<string, string>();
      for (let i = 1; i < match.length; i++) {
        matchMap.set(pattern.response.names[i - 1], match[i]);
      }
      const subMap = new Array<Map<string, string>>();
      if (pattern.subGroups) {
        const subMatches = Utils.execAll(pattern.subGroups.pattern, message);
        const subMatchMap = new Map<string, string>();
        for (const subMatch of subMatches) {
          for (let i = 1; i < subMatch.length; i++) {
            subMatchMap.set(pattern.subGroups.names[i - 1], subMatch[i]);
          }
        }
        subMap.push(subMatchMap);
      }
      history.responses.push(
        new MatchedResponse(id, history.lastLine, matchMap, subMap)
      );
      if (callback) {
        callback.call(callback, key, id, matchMap, subMap);
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
    console.log(`Command service received message: ${message}`);
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
        callback.call(
          callback,
          match.key,
          match.value.id,
          match.value.params,
          match.value.subParams
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
