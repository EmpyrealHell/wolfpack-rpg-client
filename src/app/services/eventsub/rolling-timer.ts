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
  constructor(private period: number, private max: number) {}

  /**
   * Resets the timer.
   */
  reset(): void {
    this.hits.length = 0;
  }

  /**
   * Adds an occurrence to the timer.
   * @param time The time of the occurrence, defaults to the current time.
   */
  addOccurrence(time: number = Date.now()): void {
    this.hits.push(time);
  }

  /**
   * Determines how many occurrences it would take to force the timer to meet
   * but not exceed its limit.
   * @returns Number of occurrences required to hit the limit.
   */
  availableOccurrences(): number {
    const now = Date.now();
    const threshold = now - this.period * 1000;
    let toRemove = 0;
    for (let i = 0; i < this.hits.length; i++) {
      if (this.hits[i] < threshold) {
        toRemove++;
      } else if (this.hits[i] >= threshold) {
        break;
      }
    }
    this.hits.splice(0, toRemove);
    return this.max - this.hits.length;
  }
}
