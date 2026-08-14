import { MessageQueue } from './message-queue';

describe('MessageQueue', async () => {
  it('should queue messages to send', async () => {
    const message = `test${Date.now()}`,
      queue = new MessageQueue('spec-test', 100);
    queue.send(message);
    const queueCopy = queue.queuedMessages;
    await expect(queueCopy).toContain(message);
    await expect(queueCopy.length).toBe(1);
  });

  it('should not queue duplicate messages', async () => {
    const message = `test${Date.now()}`,
      queue = new MessageQueue('spec-test', 100);
    queue.send(message);
    queue.send(message);
    const queueCopy = queue.queuedMessages;
    await expect(queueCopy.length).toBe(1);
  });

  it('should return a copy of the queued messages', async () => {
    const message = `test message at ${Date.now()}`,
      queue = new MessageQueue('spec-test', 100);
    queue.send(message);
    let queueCopy = queue.queuedMessages;
    await expect(queueCopy).toContain(message);
    queueCopy.length = 0;
    queueCopy = queue.queuedMessages;
    await expect(queueCopy).toContain(message);
  });

  it('should not allow more than 3 messages each second', async () => {
    const message = `test message sent at ${Date.now()}`,
      sendFn = {
        send: (message: string): Promise<void> =>
          new Promise(resolve => {
            resolve(undefined);
          }),
      },
      spy = spyOn(sendFn, 'send'),
      queue = new MessageQueue('spec-test', 100);
    queue.setSendFunction(sendFn.send);
    for (let i = 0; i < 3; i++) {
      queue.addSent(Date.now() - 999);
    }
    queue.send(message);
    await queue.processQueue();
    await expect(spy).not.toHaveBeenCalled();
  });

  it('should send a fourth message after 1 second', async () => {
    const message = `test message sent at ${Date.now()}`,
      sendFn = {
        send: (message: string): Promise<void> =>
          new Promise(resolve => {
            resolve(undefined);
          }),
      },
      spy = spyOn(sendFn, 'send'),
      queue = new MessageQueue('spec-test', 100);
    queue.setSendFunction(sendFn.send);
    for (let i = 0; i < 3; i++) {
      queue.addSent(Date.now() - 1001);
    }
    queue.send(message);
    await queue.processQueue();
    await expect(spy).toHaveBeenCalled();
  });

  it('should not send more than 100 messages each minute', async () => {
    const message = `test message sent at ${Date.now()}`,
      sendFn = {
        send: (message: string): Promise<void> =>
          new Promise(resolve => {
            resolve(undefined);
          }),
      },
      spy = spyOn(sendFn, 'send'),
      queue = new MessageQueue('spec-test', 100);
    queue.setSendFunction(sendFn.send);
    for (let i = 0; i < 100; i++) {
      queue.addSent(Date.now() - 59999);
    }
    queue.send(message);
    await queue.processQueue();
    await expect(spy).not.toHaveBeenCalled();
  });

  it('should send a 101st message after 1 minute', async () => {
    const message = `test message sent at ${Date.now()}`,
      sendFn = {
        send: (message: string): Promise<void> =>
          new Promise(resolve => {
            resolve(undefined);
          }),
      },
      spy = spyOn(sendFn, 'send'),
      queue = new MessageQueue('spec-test', 100);
    queue.setSendFunction(sendFn.send);
    for (let i = 0; i < 100; i++) {
      queue.addSent(Date.now() - 60001);
    }
    queue.send(message);
    await queue.processQueue();
    await expect(spy).toHaveBeenCalled();
  });

  it('should call registered callbacks when message is sent', async () => {
    const message = `test message sent at ${Date.now()}`,
      sendFn = {
        send: (message: string): Promise<void> =>
          new Promise(resolve => {
            resolve(undefined);
          }),
      },
      queue = new MessageQueue('spec-test', 100);
    queue.setSendFunction(sendFn.send);
    const callbackFn = {
        callback: (message: string): void => {},
      },
      spy = spyOn(callbackFn, 'callback');
    queue.registerSendCallback('spec-test', callbackFn.callback);
    queue.send(message);
    await queue.processQueue();
    await expect(spy).toHaveBeenCalled();
  });
});
