/**
 * Rolling timer that can determine if the number of occurrences of an event
 * are within a rolling limit.
 */
export class RollingTimer {
  private hits: number[] = [];

  /**
   * Creates a rolling timer that can tell if a new event occurrence would
   * cause the event count to exceed some number in a rolling n-second timer.
   * @param period Duration of the timer in seconds.
   * @param max Max number of occurrences in the period.
   */
  constructor(private period: number, private max: number) { }

  /**
   * Resets the timer.
   */
  reset(): void {
    this.hits.length = 0;
  }

  /**
   * Adds an occurrence to the timer.
   */
  addOccurrence(): void {
    this.hits.push(Date.now());
  }

  /**
   * Determines how many occurrences it would take to force the timer to meet
   * but not exceed its limit.
   * @returns Number of occurrences required to hit the limit.
   */
  availableOccurrences(): number {
    const now = Date.now();
    const threshold = now - this.period * 1000;
    for (let i = 0; i < this.hits.length; i++) {
      if (this.hits[i] >= threshold) {
        this.hits.splice(0, i);
        break;
      }
    }
    return this.max - this.hits.length;
  }
}
