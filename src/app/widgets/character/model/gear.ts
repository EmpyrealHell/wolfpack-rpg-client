import { Stats } from './stats';

/**
 * Collection of gear a character can equip at once.
 */
export class Gear {
  /**
   * The armor slot. Provides small bonuses, but to more stats.
   */
  armor = new Item();
  /**
   * The weapon slot. Provides larger bonuses, but to fewer stats.
   */
  weapon = new Item();
}

/**
 * Enumeration of the possible item rarities.
 */
export enum Rarity {
  /**
   * Used when the item hasn't been updated yet.
   */
  none,
  /**
   * The lowest level of item rarity, provides a few small bonuses.
   */
  uncommon,
  /**
   * Middle tier of rarity, provides stronger bonuses to more stats.
   */
  rare,
  /**
   * Best quality gear, provides large bonuses to many stats.
   */
  epic,
}

/**
 * Object representing a piece of equipment.
 */
export class Item {
  private static defaultName = 'Empty';

  /**
   * The display name of the item.
   */
  name? = Item.defaultName;
  /**
   * The id of the item in the inventory.
   */
  id = -1;
  /**
   * The item's rarity.
   */
  rarity = Rarity.none;
  /**
   * The bonus stats the item confers while equipped.
   */
  stats? = new Stats();

  /**
   * Return true if the item has been updated.
   */
  isSet(): boolean {
    return this.name !== Item.defaultName;
  }
}
