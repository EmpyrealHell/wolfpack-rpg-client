/**
 * A type of item, used to determine which classes can equip it.
 */
export class ItemType {
  public static default = new ItemType(0, '');

  /**
   * @param id The type id.
   * @param name The name of the item type.
   */
  constructor(
    public id: number,
    public name: string
  ) {}
}

/**
 * An item quality, which determines its display color.
 */
export class ItemQuality {
  public static default = new ItemQuality(0, '', '');
  /**
   * The shadow color to use when rendering text for items of this quality.
   */
  public shadow: string;

  /**
   * @param id The quality id.
   * @param name The name of the quality.
   * @param color The color to use for text and item backgrounds.
   */
  constructor(
    public id: number,
    public name: string,
    public color: string
  ) {
    this.shadow = this.getShadowColor(color);
  }

  /**
   * Creates a darker version of the same color to use for text shadows.
   *
   * @param color An html color string in the format of #ffffff.
   * @returns The color to use as a text shadow for this color.
   */
  getShadowColor(color: string): string {
    const red = Math.round(parseInt(color.substring(1, 3), 16) / 2);
    const green = Math.round(parseInt(color.substring(3, 5), 16) / 2);
    const blue = Math.round(parseInt(color.substring(5, 7), 16) / 2);
    return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
  }
}

/**
 * An item slot, which determines how it can be equipped.
 */
export class ItemSlot {
  public static default = new ItemSlot(0, '', 0);

  /**
   * @param id The slot id.
   * @param name The name of the slot.
   * @param max The max number of items that can be equipped in this slot.
   */
  constructor(
    public id: number,
    public name: string,
    public max: number
  ) {}
}

/**
 * Object representing a item.
 */
export class Item {
  /**
   * The id of the item in the database.
   */
  id = -1;
  /**
   * The index of the item in the player's inventory.
   */
  index = 0;
  /**
   * How many of this item the player has.
   */
  count = 1;
  /**
   * The max amount of this item the player can have.
   */
  max = 1;
  /**
   * The display name of the item.
   */
  name = '';
  /**
   * The item description.
   */
  description = '';
  /**
   * The items equipped status.
   */
  isEquipped = false;
  /**
   * The item's quality.
   */
  quality = ItemQuality.default;
  /**
   * The slot this item goes in.
   */
  slot = ItemSlot.default;
  /**
   * The type of this item.
   */
  type = ItemType.default;

  /**
   * The bonus to success chance this item provides.
   */
  successChance = 0;
  /**
   * The bonus to experience from dungeons this item provides.
   */
  xpBonus = 0;
  /**
   * The bonus to coins from dungeons this item provides.
   */
  coinBonus = 0;
  /**
   * The bonus chance to find items in dungeon this item provides.
   */
  itemFind = 0;
  /**
   * The chance to prevent death on dungeon failure this item provides.
   */
  preventDeath = 0;
}
