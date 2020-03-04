/**
 * Holds data about the character's experience level.
 */
export class Experience {
  /**
   * The character's experience level.
   */
  level = 0;
  /**
   * The character's prestige level.
   */
  prestige = 0;
  /**
   * The total amount of experience the character has earned.
   */
  xpTotal = 0;
  /**
   * The amount of experience the character has earned toward the next level.
   */
  xpInLevel = 0;
  /**
   * The total experience the character needs to reach the next level.
   */
  xpToNext = 10;
  /**
   * The percent of experience earned in the current level towards the next.
   */
  progress = 0;

  private minimumForLevel(level: number): number {
    return 4 * Math.pow(level + 1, 3) + 50;
  }

  /**
   * Updates the experience object based on the values returned by the
   * !stats command.
   * @param level The character's experience level.
   * @param prestige The character's prestige level.
   * @param current The total amount of experience the character has earned.
   * @param toNext The amount needed to reach the next level.
   */
  update(level: number, prestige: number, current: number, toNext: number): void {
    this.level = level;
    this.prestige = prestige;
    this.xpTotal = current;
    this.xpInLevel = current - this.minimumForLevel(this.level - 1);
    this.xpToNext = this.xpInLevel + toNext;
    this.progress = (this.xpToNext > 0) ? (this.xpInLevel / this.xpToNext * 100) : 0;
  }

  updateStrings(level: string, prestige: string, current: string, toNext: string): void {
    this.update(Number(level),
      Number(prestige),
      Number(current),
      Number(toNext));
  }
}
