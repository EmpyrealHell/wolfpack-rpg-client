import { Injectable } from '@angular/core';
import { IrcService } from '../irc/irc.service.js';
import { ChatCommands } from './chat-commands.js';
import { CommandWrapper } from './command-wrapper.js';
import { DungeonCommands } from './dungeon-commands.js';
import { FishingCommands } from './fishing-commands.js';
import { InfoCommands } from './info-commands.js';
import { InventoryCommands } from './inventory-commands.js';
import { PartyCommands } from './party-commands.js';
import { PendingCommands } from './pending-commands.js';
import { PetsCommands } from './pets-commands.js';
import { ShopCommands } from './shop-commands.js';

/**
 * Service that sends messages based on the command data json config file.
 */
@Injectable({
  providedIn: 'root',
})
export class CommandService extends CommandWrapper {
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
    super();
    this.chat = new ChatCommands(ircService);
    this.dungeon = new DungeonCommands(ircService);
    this.fishing = new FishingCommands(ircService);
    this.info = new InfoCommands(ircService);
    this.inventory = new InventoryCommands(ircService);
    this.party = new PartyCommands(ircService);
    this.pending = new PendingCommands(ircService);
    this.pets = new PetsCommands(ircService);
    this.shop = new ShopCommands(ircService);
  }
}
