import { Injectable } from '@angular/core';
import { Utils } from 'src/app/util/utils';
import { ChatCommands } from './chat-commands';
import * as CommandData from './command-data.json';
import { CommandLoader } from './command-loader';
import {
  CommandResponse,
  MatchedResponse,
  ResponseHistory,
} from './command-response';
import { DungeonCommands } from './dungeon-commands';
import { FishingCommands } from './fishing-commands';
import { InfoCommands } from './info-commands';
import { InventoryCommands } from './inventory-commands';
import { PartyCommands } from './party-commands';
import { PendingCommands } from './pending-commands';
import { PetsCommands } from './pets-commands';
import { ShopCommands } from './shop-commands';
import { EventSubService, Message } from '../eventsub/eventsub.service';

/**
 * Defines the structure of a callback method that can be used to subscribe to
 * a message or command response.
 */
export type CommandCallback = (
  name: string,
  id: string,
  groups: Map<string, string>,
  subGroups: Array<Map<string, string>>,
  date: number,
  isReplay?: boolean
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

  constructor(private eventSubService: EventSubService) {
    this.initialize();
  }

  initialize(): void {
    this.chat = new ChatCommands(this.eventSubService);
    this.dungeon = new DungeonCommands(this.eventSubService);
    this.fishing = new FishingCommands(this.eventSubService);
    this.info = new InfoCommands(this.eventSubService);
    this.inventory = new InventoryCommands(this.eventSubService);
    this.party = new PartyCommands(this.eventSubService);
    this.pending = new PendingCommands(this.eventSubService);
    this.pets = new PetsCommands(this.eventSubService);
    this.shop = new ShopCommands(this.eventSubService);

    this.messages = new CommandLoader();
    this.messages.load();
    this.eventSubService.register(
      'command-service',
      message => {
        this.onIncomingWhisper(message);
      },
      true
    );
    this.eventSubService.register('command-service', message => {
      console.log('EventSub Message received:', message);
      this.onIncomingWhisper(message);
    });
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
    for (let i = history.lastLine; i < this.eventSubService.lines.length; i++) {
      const line = this.eventSubService.lines[i];
      this.handleResponseGroup(line, key, messages, history);
    }
    return history;
  }

  private handleResponseGroup(
    message: Message,
    key: string,
    responseGroup: Map<string, CommandResponse>,
    history: ResponseHistory,
    callback: CommandCallback | undefined = undefined
  ) {
    for (const [id, pattern] of responseGroup) {
      const match = pattern.response.pattern.exec(message.text);
      if (!match) {
        continue;
      }
      const matchMap = new Map<string, string>();
      for (let i = 1; i < match.length; i++) {
        matchMap.set(pattern.response.names[i - 1], match[i]);
      }
      const subMap = new Array<Map<string, string>>();
      if (pattern.subGroups) {
        let container = message.text;
        if (pattern.subGroups.container) {
          container = matchMap.get(pattern.subGroups.container) ?? message.text;
        }
        const subMatches = Utils.execAll(
          pattern.subGroups.pattern.pattern,
          container ?? message.text
        );
        for (const subMatch of subMatches) {
          const subMatchMap = new Map<string, string>();
          for (let i = 1; i < subMatch.length; i++) {
            subMatchMap.set(
              pattern.subGroups.pattern.names[i - 1],
              subMatch[i]
            );
          }
          subMap.push(subMatchMap);
        }
      }
      history.responses.push(
        new MatchedResponse(
          id,
          history.lastLine,
          matchMap,
          subMap,
          message.timestamp
        )
      );
      if (callback) {
        callback.call(callback, key, id, matchMap, subMap, message.timestamp);
      }
    }
  }

  /**
   * Processes an incoming message, determining if it matches any known
   * patterns and calling their registered listeners with capture groups
   * extracted.
   * @param message The message the client received.
   */
  onIncomingWhisper(message: Message): void {
    for (const [subscriber, callbacks] of this.callbacks) {
      for (const [key, callback] of callbacks) {
        let history = this.matches.get(key);
        if (!history) {
          history = new ResponseHistory();
          this.matches.set(key, history);
        }
        history.lastLine = this.eventSubService.lines
          ? this.eventSubService.lines.length
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
   * category is detected in the eventsub stream.
   * @param group The name of the command group.
   * @param command The name of the individual command.
   * @param responses Must be responses to maintain type safety.
   * @param result The type of result (success, failure, etc.).
   * @param callback The method to call when the command response is detected.
   * @returns A string representing the command response id.
   */
  subscribeToCommand<
    G extends keyof typeof CommandData.commands,
    C extends keyof (typeof CommandData.commands)[G],
    R extends keyof (typeof CommandData.commands)[G][C],
    S extends keyof (typeof CommandData.commands)[G][C][R],
  >(
    group: G,
    command: C,
    responses: R,
    result: S,
    subscriber: string,
    callback: CommandCallback
  ): string {
    const key = `command.${group}.${String(command)}.${String(result)}`;
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
   * in the eventsub stream.
   * @param group The name of the message group.
   * @param name The name of the individual message.
   * @param callback The method to call when the message is detected.
   * @returns A string representing the message id.
   */
  subscribeToMessage<
    G extends keyof typeof CommandData.messages,
    N extends keyof (typeof CommandData.messages)[G],
  >(group: G, name: N, subscriber: string, callback: CommandCallback): string {
    const key = `message.${group}.${String(name)}`;
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
          match.value.subParams,
          match.value.date,
          true
        );
      }
    }
  }

  /**
   * Subscribes to a command by its id. This will cause the callback passed in
   * to be called with the capture groups provided when the command response
   * category is detected in the eventsub stream.
   * @param group The name of the command group.
   * @param command The name of the individual command.
   * @param responses Must be responses to maintain type safety.
   * @param result The type of result (success, failure, etc.).
   * @param callback The method to call when the command response is detected.
   * @returns A string representing the command response id.
   */
  hasCommandBeenSent<
    G extends keyof typeof CommandData.commands,
    C extends keyof (typeof CommandData.commands)[G],
  >(group: G, command: C): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const lines = this.eventSubService.lines;
    const queue = this.eventSubService.messageQueue.queuedMessages;
    for (const variant of commands) {
      if (
        lines.filter(x => x.text === variant).length > 0 ||
        queue.indexOf(variant) >= 0
      ) {
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
  sendInitialCommand<
    G extends keyof typeof CommandData.commands,
    C extends keyof (typeof CommandData.commands)[G],
  >(group: G, command: C): void {
    if (!this.hasCommandBeenSent(group, command)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const commandObject = CommandData.commands[group][command] as any;
      if (commandObject.command) {
        const toSend = commandObject.command as string;
        this.eventSubService.send(toSend);
      }
    }
  }

  /**
   * Sends a command. This will send the command regardless of whether it's
   * been sent or not. It should be used to refresh data or send user actions,
   * but not as part of the initial widget setup. Use SendInitialCommand
   * instead for initial widget setup.
   * @param group The command group.
   * @param command The key of the command.
   * @param args A map of arguments and the values to use for them.
   */
  sendCommand<
    G extends keyof typeof CommandData.commands,
    C extends keyof (typeof CommandData.commands)[G],
  >(group: G, command: C): void {
    this.sendCommandWithArguments(group, command);
  }

  /**
   * Sends a command with arguments.
   * @param group The command group.
   * @param command The key of the command.
   * @param args A map of arguments and the values to use for them.
   */
  sendCommandWithArguments<
    G extends keyof typeof CommandData.commands,
    C extends keyof (typeof CommandData.commands)[G],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  >(group: G, command: C, args?: any): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commandObject = CommandData.commands[group][command] as any;
    if (commandObject.command) {
      let toSend = commandObject.command as string;
      if (args) {
        for (const key in args) {
          toSend = toSend.replace(`{${key}}`, args[key]);
        }
      }
      this.eventSubService.send(toSend);
    }
  }
}
