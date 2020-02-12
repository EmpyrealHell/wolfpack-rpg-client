import { BaseStats } from './base-stats';
import { Experience } from './experience';
import { Stats } from './stats';
import { Gear } from './gear';

/**
 * Represents the data for a charcter displayed on the character widget.
 */
export class Character {
  /**
   * Number of wolfcoins the character has.
   */
  public coins = 0;
  /**
   * The character's current class name.
   */
  public class = 'Adventurer';
  /**
   * Object holding level, prestige, and experience data.
   */
  public experience = new Experience();
  public stats = new Stats();
  public gear = new Gear();

  /**
   * Sets the class and applies its base stats to this object.
   * @param newClass The name of the class to set.
   */
  public setClass(newClass: string): void {
    this.class = newClass;
    this.stats = BaseStats.byClass(newClass);
  }

  /**
   * Calculates the final stats for this character, accounting for base stats
   * and any equipped gear.
   */
  public calculatStats(): Stats {
    const stats = new Stats();
    stats.add(this.stats);
    stats.add(this.gear.armor.stats);
    stats.add(this.gear.weapon.stats);
    return stats;
  }
}
