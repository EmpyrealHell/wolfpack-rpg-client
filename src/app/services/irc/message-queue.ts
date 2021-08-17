import { RollingTimer } from './rolling-timer';

export type SendFunction = (
  account: string,
  message: string
) => Promise<[string, string]>;

export type SendCallback = (message: string) => void;

export type CheckFunction = () => boolean;

/**
 * Handles rate limiting for sending messages to twitch via irc.
 */
export class MessageQueue {
  private queue: string[] = [];
  private secondTimer = new RollingTimer(1, 3);
  private minuteTimer = new RollingTimer(60, 100);
  private timer: number | undefined;
  private sendFn: SendFunction | undefined;
  private checkFn: CheckFunction | undefined;
  private sendCallbacks = new Map<string, SendCallback>();
  private minimumDelay = 600;
  private lastSend = 0;

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
    return Math.min(
      this.secondTimer.availableOccurrences(),
      this.minuteTimer.availableOccurrences()
    );
  }

  constructor(private account: string, private rate: number) {}

  private canSend(): boolean {
    if (this.checkFn) {
      return this.checkFn.call(this.checkFn);
    }
    return true;
  }

  private delayElapsed(): boolean {
    const now = Date.now();
    return now - this.lastSend >= this.minimumDelay;
  }

  private broadcastSend(message: string): void {
    for (const [key, value] of this.sendCallbacks) {
      value.call(value, message);
    }
  }

  private async sendMessages(count: number): Promise<void> {
    if (this.sendFn && this.canSend() && this.delayElapsed()) {
      const toSend = this.queue.splice(0, count);
      for (const message of toSend) {
        await this.broadcastSend(message);
        await this.sendFn.call(this.sendFn, this.account, message);
        this.secondTimer.addOccurrence();
        this.minuteTimer.addOccurrence();
        this.lastSend = Date.now();
      }
    }
  }

  private continue(): void {
    this.timer = window.setTimeout(async () => {
      await this.processQueue();
    }, this.rate);
  }

  /**
   * Sends any pending messages that can be sent based on the timers.
   */
  async processQueue(): Promise<void> {
    if (this.queue.length > 0) {
      const limit = Math.min(this.queue.length, this.availableOccurrences);
      if (limit > 0) {
        await this.sendMessages(1);
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
   */
  setSendFunction(sendFn: SendFunction) {
    this.sendFn = sendFn;
  }

  /**
   * Sets the function to call before attempting to send a message. This
   * function must return true for messages to be sent.
   * @param checkFn The function called before sending messages.
   */
  setCheckFn(checkFn: CheckFunction) {
    this.checkFn = checkFn;
  }

  /**
   * Registers a function to be called when the message queue sends a message.
   * @param id The id of the callback to add.
   * @param callback The callback method to call.
   * @param overwrite Whether or not to overwrite existing callbacks with the
   * same id.
   */
  registerSendCallback(
    id: string,
    callback: SendCallback,
    overwrite = false
  ): void {
    if (!this.sendCallbacks.has(id) || overwrite) {
      this.sendCallbacks.set(id, callback);
    }
  }

  /**
   * Removes a registered callback listener.
   * @param id The id of the callback to remove.
   */
  unregisterSendCallback(id: string): void {
    if (this.sendCallbacks.has(id)) {
      this.sendCallbacks.delete(id);
    }
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
  async start(): Promise<void> {
    await this.processQueue();
    this.continue();
  }

  /**
   * Stops the message queue.
   */
  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }
}
