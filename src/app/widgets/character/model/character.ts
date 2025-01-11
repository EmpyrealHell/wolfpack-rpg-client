import { Item } from '../../inventory/model/item';

/**
 * Represents the data for a charcter displayed on the character widget.
 */
export class Character {
  /**
   * Number of wolfcoins the character has.
   */
  coins = 0;
  /**
   * Character class object for the player's current class.
   */
  class = CharacterClass.default;
  /**
   * Player's current level.
   */
  level = 0;
  /**
   * Player's total experience earned.
   */
  experience = 0;
  /**
   * Player's prestige level.
   */
  prestige = 0;
  /**
   * The player's subscriber status.
   */
  subscriber = false;
  /**
   * Player's inventory.
   */
  inventory: Item[] = [];

  public minForLevel(level: number): number {
    return 4 * Math.pow(level, 3) + 50;
  }

  public levelFromXp(xp: number): number {
    return 0;
  }

  /**
   * @returns The amount of experience the player has earned in the current level.
   */
  public xpAmount(): number {
    const amount = this.experience - this.minForLevel(this.level);
    return Math.max(amount, 0);
  }

  /**
   * @returns The amount of experience the player needs to reach the next level.
   */
  public xpNeeded(): number {
    return this.minForLevel(this.level + 1) - this.minForLevel(this.level);
  }

  /**
   * @returns The player's progress through the current level as a number from 0 to 1.
   */
  public xpProgress(): number {
    const total = this.xpNeeded();
    const amount = this.xpAmount();
    return amount / total;
  }
}

/**
 * A character class that determines the player's base stats and what gear they can equip.
 */
export class CharacterClass {
  public static default = new CharacterClass(0, 'Adventurer', 0, 0, 0, 0, 0);

  /**
   * @param id The class id.
   * @param name The class name.
   * @param successChance Bonus chance to succeed a dungeon.
   * @param xpBonus Bonus to experience earned from dungeons.
   * @param coinBonus Bonus to coins earned from dungeons.
   * @param itemFind Bonus chance to find items in dungeons.
   * @param preventDeath Bonus chance to prevent death when failing a dungeon.
   */
  constructor(
    public id: number,
    public name: string,
    public successChance: number,
    public xpBonus: number,
    public coinBonus: number,
    public itemFind: number,
    public preventDeath: number
  ) {}
}
