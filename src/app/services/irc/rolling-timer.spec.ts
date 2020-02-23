import { RollingTimer } from './rolling-timer';

describe('RollingTimer', () => {
  it('should indicate when the limit is reached', () => {
    const timer = new RollingTimer(1, 1);
    timer.addOccurrence();
    expect(timer.availableOccurrences()).toBe(0);
  });

  it('should indicate how many instances remain in the timer', () => {
    const max = 10;
    const timer = new RollingTimer(1, max);
    timer.addOccurrence();
    expect(timer.availableOccurrences()).toBe(max - 1);
  });

  it('should roll the timer based on elapsed time', async () => {
    const timer = new RollingTimer(.1, 2);
    const delay = async () => new Promise(resolve => setTimeout(resolve, 50));
    timer.addOccurrence();
    expect(timer.availableOccurrences()).toBe(1);
    await delay();
    timer.addOccurrence();
    expect(timer.availableOccurrences()).toBe(0);
    await delay();
    expect(timer.availableOccurrences()).toBe(1);
  });
});
