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
    ['Cleric', new BaseStats('preventDeath', '', '', 3)]
  ]);

  /**
   * Primary stat, which provides a 10% increase.
   */
  primary: string;
  /**
   * Secondary stat, which provides a 5% increase;
   */
  secondary: string;
  /**
   * Tertiary stat, which provides a 3% increase.
   */
  tertiary: string;
  /**
   * Default value for all stats.
   */
  flat: number;

  /**
   * Gets a stats block of the base stats for a given class.
   * @param className Name of the class to get the base for.
   */
  static byClass(className: string): Stats {
    const base = BaseStats.statsByClass.get(className);
    if (base) {
      const stats = new Stats(base.flat);
      stats.updateStat(base.primary, 10);
      stats.updateStat(base.secondary, 5);
      stats.updateStat(base.tertiary, 3);
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
  constructor(primary: string, secondary: string, tertiary: string, flat = 0) {
    this.primary = primary;
    this.flat = flat;
    this.secondary = secondary;
    this.tertiary = tertiary;
  }
}
