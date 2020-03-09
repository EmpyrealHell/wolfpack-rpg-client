import { MessageQueue } from './message-queue';

describe('MessageQueue', () => {
  beforeEach(() => {
    const queue = new MessageQueue('spec-test', 100);
  });

  it('should queue messages to send', () => {
    const message = `test${Date.now()}`;
    const queue = new MessageQueue('spec-test', 100);
    queue.send(message);
    const queueCopy = queue.queuedMessages;
    expect(queueCopy).toContain(message);
    expect(queueCopy.length).toBe(1);
  });

  it('should not queue duplicate messages', () => {
    const message = `test${Date.now()}`;
    const queue = new MessageQueue('spec-test', 100);
    queue.send(message);
    queue.send(message);
    const queueCopy = queue.queuedMessages;
    expect(queueCopy.length).toBe(1);
  });

  it('should return a copy of the queued messages', () => {
    const message = `test message at ${Date.now()}`;
    const queue = new MessageQueue('spec-test', 100);
    queue.send(message);
    let queueCopy = queue.queuedMessages;
    expect(queueCopy).toContain(message);
    queueCopy.length = 0;
    queueCopy = queue.queuedMessages;
    expect(queueCopy).toContain(message);
  });

  it('should not allow more than 3 messages each second', async () => {
    const message = `test message sent at ${Date.now()}`;
    const sendFn = {
      send: (account: string, message: string): Promise<[string, string]> => {
        return new Promise(resolve => {
          resolve(['', '']);
        });
      },
    };
    const spy = spyOn(sendFn, 'send');
    const queue = new MessageQueue('spec-test', 100);
    queue.setSendFunction(sendFn.send);
    for (let i = 0; i < 3; i++) {
      queue.addSent(Date.now() - 999);
    }
    queue.send(message);
    await queue.processQueue();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should send a fourth message after 1 second', async () => {
    const message = `test message sent at ${Date.now()}`;
    const sendFn = {
      send: (account: string, message: string): Promise<[string, string]> => {
        return new Promise(resolve => {
          resolve(['', '']);
        });
      },
    };
    const spy = spyOn(sendFn, 'send');
    const queue = new MessageQueue('spec-test', 100);
    queue.setSendFunction(sendFn.send);
    for (let i = 0; i < 3; i++) {
      queue.addSent(Date.now() - 1001);
    }
    queue.send(message);
    await queue.processQueue();
    expect(spy).toHaveBeenCalled();
  });

  it('should not send more than 100 messages each minute', async () => {
    const message = `test message sent at ${Date.now()}`;
    const sendFn = {
      send: (account: string, message: string): Promise<[string, string]> => {
        return new Promise(resolve => {
          resolve(['', '']);
        });
      },
    };
    const spy = spyOn(sendFn, 'send');
    const queue = new MessageQueue('spec-test', 100);
    queue.setSendFunction(sendFn.send);
    for (let i = 0; i < 100; i++) {
      queue.addSent(Date.now() - 59999);
    }
    queue.send(message);
    await queue.processQueue();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should send a 101st message after 1 minute', async () => {
    const message = `test message sent at ${Date.now()}`;
    const sendFn = {
      send: (account: string, message: string): Promise<[string, string]> => {
        return new Promise(resolve => {
          resolve(['', '']);
        });
      },
    };
    const spy = spyOn(sendFn, 'send');
    const queue = new MessageQueue('spec-test', 100);
    queue.setSendFunction(sendFn.send);
    for (let i = 0; i < 100; i++) {
      queue.addSent(Date.now() - 60001);
    }
    queue.send(message);
    await queue.processQueue();
    expect(spy).toHaveBeenCalled();
  });
});
