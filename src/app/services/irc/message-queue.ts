import { RollingTimer } from './rolling-timer';
import { Client } from 'tmi.js';

export type SendFunction = (account: string, message: string) => Promise<[string, string]>;

/**
 * Handles rate limiting for sending messages to twitch via irc.
 */
export class MessageQueue {
  private queue: string[] = [];
  private secondTimer = new RollingTimer(1, 3);
  private minuteTimer = new RollingTimer(60, 100);
  private timer: number | null = null;
  private sendFn: SendFunction | null = null;
  private sendThis: Client | null = null;

  /**
   * The list of messages to send through the queue.
   */
  get queuedMessages(): string[] {
    return [...this.queue];
  }

  /**
   * The number of messages that can be sent at the current time.
   */
  get availableOccurrences(): number {
    return Math.min(this.secondTimer.availableOccurrences(),
      this.minuteTimer.availableOccurrences());
  }

  constructor(private account: string, private rate: number) { }
  
  private async sendMessages(count: number): Promise<void> {
    if (this.sendFn) {
      const toSend = this.queue.splice(0, count);
      console.log(toSend);
      for (const message of toSend) {
        await this.sendFn.call(this.sendThis ? this.sendThis : this.sendFn, this.account, message);
        this.secondTimer.addOccurrence();
        this.minuteTimer.addOccurrence();
      }
      console.log('sent!');
    }
  }

  private continue(): void {
    this.timer = window.setTimeout(async () => { await this.processQueue(); }, this.rate);
  }

  /**
   * Sends any pending messages that can be sent based on the timers.
   */
  async processQueue(): Promise<void> {
    if (this.queue.length > 0) {
      const limit = Math.min(this.queue.length, this.availableOccurrences);
      if (limit > 0) {
        await this.sendMessages(limit);
      }
    }
    if (this.timer) {
      this.continue();
    }
  }

  /**
   * Resets the static properties of the message queue to their default state.
   */
  reset(): void {
    this.queue.length = 0;
    this.secondTimer.reset();
    this.minuteTimer.reset();
    this.stop();
  }

  /**
   * Sets the function to call when a message is available in the queue.
   * @param sendFn The function to send the messages to.
   * @param sendThis The object to set as 'this' for the send function.
   */
  setSendFunction(sendFn: SendFunction, sendThis?: Client) {
    this.sendFn = sendFn;
    this.sendThis = sendThis ? sendThis : null;
  }

  /**
   * Enqueues a message to send through the queue's rate limiter.
   * @param message The message to add to the queue.
   * @param allowDupes If false, the message will not be enqueued if it already
   * exists in the queue.
   */
  send(message: string, allowDupes = false): void {
    if (allowDupes || this.queue.indexOf(message) === -1) {
      this.queue.push(message);
    }
  }

  /**
   * Adds a message occurrence to the timers, which can be used to force a
   * timer delay.
   * @param time The time the send occurred.
   */
  addSent(time: number): void {
    this.minuteTimer.addOccurrence(time);
    this.secondTimer.addOccurrence(time);
  }

  /**
   * Starts the message queue.
   */
  start(): void {
    this.processQueue();
    this.continue();
  }

  /**
   * Stops the message queue.
   */
  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
