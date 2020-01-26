/**
 * Represents the statistical value of a character of piece of gear.
 */
export class Stats {
  /**
   * Maps a display name sent in a whisper to the name of the stat property.
   */
  public static variableNameMap = new Map<string, string>([
    ['Success Chance', 'successChance'],
    ['XP Bonus', 'xpBonus'],
    ['Wolfcoin Bonus', 'wolfcoinBonus'],
    ['Item Find', 'itemFind'],
    ['to Prevent Death', 'preventDeath'],
  ]);

  /**
   * Maps a variable name to the display name used in the UI.
   */
  public static displayNameMap = new Map<string, string>([
    ['successChance', 'Success Chance'],
    ['xpBonus', 'XP Bonus'],
    ['wolfcoinBonus', 'Wolfcoin Bonus'],
    ['itemFind', 'Item Find'],
    ['preventDeath', 'Prevent Death'],
  ]);

  /**
   * Bonus chance for success on dungeon fights.
   */
  public successChance = 0;
  /**
   * Bonus to experience earned.
   */
  public xpBonus = 0;
  /**
   * Bonus to wolfcoins rewards.
   */
  public wolfcoinBonus = 0;
  /**
   * Bonus to chance of getting a drop.
   */
  public itemFind = 0;
  /**
   * Chance to avoid death on a failed dungeon attempt.
   */
  public preventDeath = 0;
  /**
   * Stats that have been updated from their defaults.
   */
  public updatedStats = new Array<string>();

  /**
   * @param base The value to assign to each stat.
   */
  constructor(base: number = 0) {
    this.successChance = base;
    this.xpBonus = base;
    this.wolfcoinBonus = base;
    this.itemFind = base;
    this.preventDeath = base;
  }

  /**
   * Determines if any of this object's stats have been updated.
   */
  public hasStats(): boolean {
    return this.updatedStats.length > 0;
  }

  /**
   * Sets a stat's value by name.
   * @param name The name of the stat to update.
   * @param value The value to assign the stat.
   */
  public updateStat(name: string, value: number): void {
    if (Stats.variableNameMap.has(name)) {
      const varName = Stats.variableNameMap.get(name);
      this.updatedStats.push(varName);
      this[varName] = value;
    }
  }

  /**
   * Adds another stat block's values to this one.
   * @param other A stat block to add to this one.
   */
  public add(other: Stats) {
    this.successChance += other.successChance;
    this.xpBonus += other.xpBonus;
    this.wolfcoinBonus += other.wolfcoinBonus;
    this.itemFind += other.itemFind;
    this.preventDeath += other.preventDeath;
  }
}
