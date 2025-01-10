export class ItemType {
  public static default = new ItemType(0, '');
  constructor(
    public id: number,
    public name: string
  ) {}
}
export class ItemQuality {
  public static default = new ItemQuality(0, '', '');
  constructor(
    public id: number,
    public name: string,
    public color: string
  ) {}
}
export class ItemSlot {
  public static default = new ItemSlot(0, '', 0);
  constructor(
    public id: number,
    public name: string,
    public max: number
  ) {}
}

/**
 * Object representing a piece of equipment.
 */
export class Item {
  /**
   * The id of the item in the inventory.
   */
  id = -1;
  count = 1;
  max = 1;
  /**
   * The display name of the item.
   */
  name = '';
  /**
   * The item description.
   */
  description = '';
  isEquipped = false;
  /**
   * The item's quality.
   */
  quality = ItemQuality.default;
  slot = ItemSlot.default;
  type = ItemType.default;

  successChance = 0;
  xpBonus = 0;
  coinBonus = 0;
  itemFind = 0;
  preventDeath = 0;
}
