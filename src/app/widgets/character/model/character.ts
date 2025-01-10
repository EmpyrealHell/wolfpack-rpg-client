import { Item } from './gear';

/**
 * Represents the data for a charcter displayed on the character widget.
 */
export class Character {
  /**
   * Number of wolfcoins the character has.
   */
  coins = 0;
  /**
   * The character's current class name.
   */
  class = CharacterClass.default;
  /**
   * Object holding level, prestige, and experience data.
   */
  level = 0;
  experience = 0;
  prestige = 0;
  inventory: Item[] = [];

  public minForLevel(level: number): number {
    return 4 * Math.pow(level + 1, 3) + 50;
  }

  public xpAmount(): number {
    const amount = this.experience - this.minForLevel(this.level);
    return amount;
  }

  public xpNeeded(): number {
    return this.minForLevel(this.level + 1) - this.minForLevel(this.level);
  }

  public xpProgress(): number {
    const total = this.xpNeeded();
    const amount = this.xpAmount();
    return amount / total;
  }
}

export class CharacterClass {
  public static default = new CharacterClass(0, 'Adventurer', 0, 0, 0, 0, 0);

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
