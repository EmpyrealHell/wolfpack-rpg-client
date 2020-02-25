/**
 * Represents the statistical value of a character of piece of gear.
 */
export class Stats {
  /**
   * Maps a display name sent in a whisper to the name of the stat property.
   */
  static variableNameMap = new Map<string, string>([
    ['Success Chance', 'successChance'],
    ['XP Bonus', 'xpBonus'],
    ['Wolfcoin Bonus', 'wolfcoinBonus'],
    ['Item Find', 'itemFind'],
    ['to Prevent Death', 'preventDeath'],
  ]);

  /**
   * Maps a variable name to the display name used in the UI.
   */
  static displayNameMap = new Map<string, string>([
    ['successChance', 'Success Chance'],
    ['xpBonus', 'XP Bonus'],
    ['wolfcoinBonus', 'Wolfcoin Bonus'],
    ['itemFind', 'Item Find'],
    ['preventDeath', 'Prevent Death'],
  ]);

  static variableUpdateMap = new Map<string, (ref: Stats, value: number) => void>([
    ['successChance', (ref, value) => { ref.successChance = value; }],
    ['xpBonus', (ref, value) => { ref.xpBonus = value; }],
    ['wolfcoinBonus', (ref, value) => { ref.wolfcoinBonus = value; }],
    ['itemFind', (ref, value) => { ref.itemFind = value; }],
    ['preventDeath', (ref, value) => { ref.preventDeath = value; }]
  ]);

  /**
   * Bonus chance for success on dungeon fights.
   */
  successChance = 0;
  /**
   * Bonus to experience earned.
   */
  xpBonus = 0;
  /**
   * Bonus to wolfcoins rewards.
   */
  wolfcoinBonus = 0;
  /**
   * Bonus to chance of getting a drop.
   */
  itemFind = 0;
  /**
   * Chance to avoid death on a failed dungeon attempt.
   */
  preventDeath = 0;
  /**
   * Stats that have been updated from their defaults.
   */
  updatedStats = new Array<string>();

  /**
   * @param base The value to assign to each stat.
   */
  constructor(base = 0) {
    this.successChance = base;
    this.xpBonus = base;
    this.wolfcoinBonus = base;
    this.itemFind = base;
    this.preventDeath = base;
  }

  /**
   * Determines if any of this object's stats have been updated.
   */
  hasStats(): boolean {
    return this.updatedStats.length > 0;
  }

  /**
   * Sets a stat's value by name.
   * @param name The name of the stat to update.
   * @param value The value to assign the stat.
   */
  updateStat(name: string, value: number): void {
    const updater = Stats.variableUpdateMap.get(name);
    if (updater) {
      this.updatedStats.push(name);
      updater(this, value);
    }
  }

  /**
   * Sets a stat's value by the chat description.
   * @param description The description of the stat to update.
   * @param value The value to assign the stat.
   */
  updateStatByDescription(description: string, value: number): void {
    const varName = Stats.variableNameMap.get(description);
    if (varName) {
      this.updatedStats.push(varName);
      const updater = Stats.variableUpdateMap.get(varName);
      if (updater) {
        updater(this, value);
      }
    }
  }

  /**
   * Adds another stat block's values to this one.
   * @param other A stat block to add to this one.
   */
  add(other: Stats) {
    this.successChance += other.successChance;
    this.xpBonus += other.xpBonus;
    this.wolfcoinBonus += other.wolfcoinBonus;
    this.itemFind += other.itemFind;
    this.preventDeath += other.preventDeath;
  }
}
