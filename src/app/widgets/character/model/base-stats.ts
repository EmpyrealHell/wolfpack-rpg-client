import { Stats } from './stats';

/**
 * Represents the base stats a class can have.
 */
export class BaseStats {
  private static statsByClass = new Map<string, BaseStats>([
    ['Warrior', new BaseStats('successChance', 'wolfcoinBonus', 'itemFind')],
    ['Mage', new BaseStats('itemfind', 'xpBonus', 'successChance')],
    ['Rogue', new BaseStats('wolfcoinBonus', 'itemFind', 'xpBonus')],
    ['Ranger', new BaseStats('xpBonus', 'successChance', 'wolfcoinBonus')],
    ['Cleric', new BaseStats('preventDeath', null, null, 3)]
  ]);

  /**
   * Primary stat, which provides a 10% increase.
   */
  public primary: string;
  /**
   * Secondary stat, which provides a 5% increase;
   */
  public secondary: string;
  /**
   * Tertiary stat, which provides a 3% increase.
   */
  public tertiary: string;
  /**
   * Default value for all stats.
   */
  public flat: number;

  /**
   * Gets a stats block of the base stats for a given class.
   * @param className Name of the class to get the base for.
   */
  public static byClass(className: string): Stats {
    if (BaseStats.statsByClass.has(className)) {
      const base = BaseStats.statsByClass.get(className);
      const stats = new Stats(base.flat);
      stats[base.primary] = 10;
      if (base.secondary) {
        stats[base.secondary] = 5;
      }
      if (base.tertiary) {
        stats[base.tertiary] = 3;
      }
      return stats;
    } else {
      return new Stats();
    }
  }

  /**
   * @param primary Name of the primary stat (+10%).
   * @param secondary Name of the secondary stat (+5%).
   * @param tertiary Name of the tertiary stat (+3%)
   * @param flat Base value for all stats, defaults to 0.
   */
  constructor(primary: string, secondary: string, tertiary: string, flat: number = 0) {
    this.primary = primary;
    this.flat = flat;
    this.secondary = secondary;
    this.tertiary = tertiary;
  }
}
