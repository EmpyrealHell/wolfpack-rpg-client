import { HttpClient } from '@angular/common/http';
import { ClassSpy, TestUtils } from 'src/test/test-utils';
import { Config } from '../data/config-data';
import { ConfigManager } from '../data/config-manager';
import { AuthData } from '../user/auth.data';
import { UserData } from '../user/user.data';
import { UserService } from '../user/user.service';
import { EventSubService } from './eventsub.service';
import { Message } from './eventsub.service';
import { WhisperService } from './whisper.service';
import * as eventSubConfig from './eventsub.service.json';
import { of } from 'rxjs';

describe('EventSubService', () => {
  let configManagerSpy: ClassSpy<ConfigManager>,
    httpClientSpy: jasmine.SpyObj<HttpClient>,
    service: EventSubService,
    userServiceSpy: ClassSpy<UserService>,
    whisperServiceSpy: ClassSpy<WhisperService>;

  function createWelcomeMessage(): MessageEvent {
    return {
      data: JSON.stringify({
        metadata: { message_type: 'session_welcome' },
        payload: { session: { id: 'test-session-id' } },
      }),
    } as MessageEvent;
  }

  function createWhisperMessage(
    text: string,
    fromUserId: string
  ): MessageEvent {
    return {
      data: JSON.stringify({
        metadata: {
          message_type: 'notification',
          subscription_type: 'user.whisper.message',
        },
        payload: {
          event: {
            from_user_id: fromUserId,
            whisper: { text },
          },
        },
      }),
    } as MessageEvent;
  }

  function createChannelChatMessage(message: string): MessageEvent {
    const config = eventSubConfig;
    return {
      data: JSON.stringify({
        metadata: {
          message_type: 'notification',
          subscription_type: 'channel.chat.message',
        },
        payload: {
          event: {
            broadcaster_user_login: config.streamerAccount,
            chatter_user_login: config.botAccount,
            message: {
              text: message,
            },
          },
        },
      }),
    } as MessageEvent;
  }

  async function attachAndSend(
    message: string
  ): Promise<jasmine.SpyObj<WebSocket>> {
    const wsInstance = jasmine.createSpyObj('WebSocket', [
        'onopen',
        'onmessage',
        'onclose',
        'onerror',
      ]),
      connectPromise = service.connectUsing(() => {
        setTimeout(() => {
          if (wsInstance.onopen) {
            wsInstance.onopen({} as Event);
          }
          if (wsInstance.onmessage) {
            wsInstance.onmessage(createWelcomeMessage());
            wsInstance.onmessage(createChannelChatMessage(message));
          }
        }, 0);
        return wsInstance;
      });
    await connectPromise;
    return wsInstance;
  }

  beforeEach(() => {
    configManagerSpy = TestUtils.spyOnClass(ConfigManager);
    const configData = new Config();
    configData.authentication.token = `token${Date.now()}`;
    configManagerSpy.getConfig.and.returnValue(configData);
    userServiceSpy = TestUtils.spyOnClass(UserService);
    const authData = {
      client_id: 'clientid',
      login: 'TestUser',
      user_id: 'userid',
      scopes: [],
    } as AuthData;
    userServiceSpy.getUserAuth.and.returnValue(Promise.resolve(authData));
    const userData = {
      data: [
        {
          id: 'userid',
          login: 'TestUser',
        },
      ],
    } as UserData;
    userServiceSpy.getUserId.and.returnValue(userData);
    whisperServiceSpy = TestUtils.spyOnClass(WhisperService);
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    httpClientSpy.post.and.returnValue(of({}));
    service = new EventSubService(
      httpClientSpy,
      configManagerSpy,
      userServiceSpy as jasmine.SpyObj<UserService>,
      whisperServiceSpy as jasmine.SpyObj<WhisperService>
    );
  });

  it('should connect to EventSub', async () => {
    const queueSpy = spyOn(service.messageQueue, 'start'),
      sendFnSpy = spyOn(service.messageQueue, 'setSendFunction'),
      wsInstance = jasmine.createSpyObj('WebSocket', [
        'onopen',
        'onmessage',
        'onclose',
        'onerror',
      ]),
      connectPromise = service.connectUsing(() => {
        setTimeout(() => {
          if (wsInstance.onopen) {
            wsInstance.onopen({} as Event);
          }
          if (wsInstance.onmessage) {
            wsInstance.onmessage(createWelcomeMessage());
          }
        }, 0);
        return wsInstance;
      }),
      result = await connectPromise;
    await expect(result).toBe(true);
    await expect(service.isConnected).toBe(true);
    await expect(queueSpy).toHaveBeenCalled();
    await expect(sendFnSpy).toHaveBeenCalled();
    await expect(service.connection).toBeTruthy();
  });

  it('should return an array of received messages', async () => {
    const message = `test message at ${Date.now()}`;
    await attachAndSend(message);
    await expect(service.lines.filter(x => x.text === message)).toBeTruthy();
  });

  it('should return the full history', async () => {
    const message = `test message at ${Date.now()}`;
    await attachAndSend(message);
    await expect(service.lines.map(x => x.text)).toContain(message);
  });

  it('should register an error handler for an id', async () => {
    const errorHandler = (message: Message) => {},
      handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    const { errorHandlers } = service;
    await expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
  });

  it('should remove an error handler for an id', async () => {
    const errorHandler = (message: Message) => {},
      handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    await expect(service.errorHandlers.get(handlerKey)).toBe(errorHandler);
    service.unregisterForError(handlerKey);
    await expect(service.errorHandlers.has(handlerKey)).toBeFalsy();
  });

  it('should call registered error handlers on error', async () => {
    const consoleSpy = spyOn(console, 'error'), // Supress expected error message in terminal
      errorHandlerObj = { onError: (message: Message) => {} },
      errorSpy = spyOn(errorHandlerObj, 'onError'),
      handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandlerObj.onError);
    const wsInstance = jasmine.createSpyObj('WebSocket', [
        'onopen',
        'onmessage',
        'onclose',
        'onerror',
      ]),
      connectPromise = service.connectUsing(() => {
        setTimeout(() => {
          if (wsInstance.onerror) {
            wsInstance.onerror(new Error('WebSocket Error'));
          }
        }, 0);
        return wsInstance;
      });

    await connectPromise;
    await expect(errorSpy).toHaveBeenCalled();
    consoleSpy.calls.reset();
  });

  it('should not overwrite error handlers with the same key by default', async () => {
    const errorHandler = (message: Message) => {},
      errorHandler2 = (message: Message) => {},
      handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    service.registerForError(handlerKey, errorHandler2);
    const { errorHandlers } = service;
    await expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
    await expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler2);
  });

  it('should overwrite error handlers with the same key when forced', async () => {
    const errorHandler = (message: Message) => {},
      errorHandler2 = (message: Message) => {},
      handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    service.registerForError(handlerKey, errorHandler2, true);
    const { errorHandlers } = service;
    await expect(errorHandlers.get(handlerKey)).toBe(errorHandler2);
    await expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler);
  });

  it('should register a whisper handler for an id', async () => {
    const callback = (message: Message) => {},
      handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    await expect(service.callbacks.get(handlerKey)).toBe(callback);
  });

  it('should remove a whisper handler for an id', async () => {
    const callback = (message: Message) => {},
      handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    await expect(service.callbacks.get(handlerKey)).toBe(callback);
    service.unregister(handlerKey);
    await expect(service.callbacks.has(handlerKey)).toBeFalsy();
  });

  it('should call registered callbacks on whisper', async () => {
    const callbackObj = { onWhisper: (message: Message) => {} },
      callbackSpy = spyOn(callbackObj, 'onWhisper'),
      handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callbackObj.onWhisper);
    const wsInstance = jasmine.createSpyObj('WebSocket', [
        'onopen',
        'onmessage',
        'onclose',
        'onerror',
      ]),
      connectPromise = service.connectUsing(() => {
        setTimeout(() => {
          if (wsInstance.onopen) {
            wsInstance.onopen({} as Event);
          }
          if (wsInstance.onmessage) {
            wsInstance.onmessage(createWelcomeMessage());
            wsInstance.onmessage(
              createWhisperMessage('test whisper', 'test-user')
            );
          }
        }, 0);
        return wsInstance;
      });
    await connectPromise;
    await expect(callbackSpy).toHaveBeenCalled();
  });

  it('should not overwrite whisper handlers with the same key by default', async () => {
    const callback = (message: Message) => {},
      callback2 = (message: Message) => {},
      handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    service.register(handlerKey, callback2);
    await expect(service.callbacks.get(handlerKey)).toBe(callback);
    await expect(service.callbacks.get(handlerKey)).not.toBe(callback2);
  });

  it('should overwrite whisper handlers with the same key when forced', async () => {
    const callback = (message: Message) => {},
      callback2 = (message: Message) => {},
      handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    service.register(handlerKey, callback2, true);
    await expect(service.callbacks.get(handlerKey)).toBe(callback2);
    await expect(service.callbacks.get(handlerKey)).not.toBe(callback);
  });

  it('should handle chat messages from the bot account', async () => {
    const wsInstance = jasmine.createSpyObj('WebSocket', [
        'onopen',
        'onmessage',
        'onclose',
        'onerror',
      ]),
      chatMessage = `test chat message ${Date.now()}`,
      connectPromise = service.connectUsing(() => {
        setTimeout(() => {
          if (wsInstance.onopen) {
            wsInstance.onopen({} as Event);
          }
          if (wsInstance.onmessage) {
            wsInstance.onmessage(createWelcomeMessage());
            wsInstance.onmessage(createChannelChatMessage(chatMessage));
          }
        }, 0);
        return wsInstance;
      });

    await connectPromise;
    await expect(
      service.lines.find(x => x.text === chatMessage && !x.whisper)
    ).toBeTruthy();
  });

  it('should send queued messages', async () => {
    const message = `test message sent at ${Date.now()}`,
      sendFn = {
        send: async (message: string) =>
          new Promise<void>(resolve => {
            resolve(undefined);
          }),
      },
      spy = spyOn(sendFn, 'send');
    service.send(message);
    service.messageQueue.setSendFunction(sendFn.send);
    await service.messageQueue.processQueue();
    await expect(spy).toHaveBeenCalled();
    const call = spy.calls.mostRecent();
    await expect(call.args[0]).toBe(message);
  });

  it('should properly format messages', async () => {
    const wsInstance = new WebSocket('');
    let messageHandler: (event: MessageEvent) => void = () => {};
    spyOnProperty(wsInstance, 'onmessage', 'set').and.callFake(
      (handler: ((this: WebSocket, ev: MessageEvent) => unknown) | null) => {
        if (handler) {
          messageHandler = handler;
        }
      }
    );
    spyOnProperty(wsInstance, 'onopen', 'set').and.callFake(
      (handler: ((this: WebSocket, ev: Event) => unknown) | null) => {
        if (handler) {
          setTimeout(() => handler.call(wsInstance, {} as Event), 0);
        }
      }
    );
    spyOnProperty(wsInstance, 'onclose', 'set');
    spyOnProperty(wsInstance, 'onerror', 'set');
    await service.connectUsing(() => wsInstance);
    await new Promise(resolve => setTimeout(resolve, 0));
    const whispers: Message[] = [];
    service.register('test', (message: Message) => {
      whispers.push(message);
    });
    const timestamp = Date.now().toString(),
      userData = await userServiceSpy.getUserAuth();
    messageHandler(createWelcomeMessage());
    messageHandler(createWhisperMessage('cmd', userData.user_id));
    messageHandler(createWhisperMessage('response', 'other_user'));
    messageHandler(createWhisperMessage('cmd', userData.user_id));
    messageHandler(createWhisperMessage('at', 'other_user'));
    messageHandler(createWhisperMessage(timestamp, 'other_user'));
    messageHandler(createChannelChatMessage('bot chat message'));
    await new Promise(resolve => setTimeout(resolve, 0));
    await expect(service.lines.length).toBe(4);
    const chatMessage = service.lines.find(x => !x.whisper);
    await expect(chatMessage?.text).toBe('bot chat message');
    const whisperMessages = service.lines.filter(x => x.whisper && !x.self);
    await expect(whisperMessages[0].text).toBe('response');
    await expect(whisperMessages[1].text).toBe('at');
    await expect(whisperMessages[2].text).toBe(timestamp);
  });

  it('should handle sends from the message queue', async () => {
    const wsInstance = new WebSocket('');
    let messageCallback: Function = () => {};
    spyOnProperty(wsInstance, 'onmessage', 'set').and.callFake(
      (callback: ((this: WebSocket, ev: MessageEvent) => unknown) | null) => {
        if (callback) {
          messageCallback = callback;
        }
      }
    );
    await service.connectUsing(() => {
      setTimeout(() => {
        if (wsInstance.onopen) {
          wsInstance.onopen({} as Event);
        }
        messageCallback(createWelcomeMessage());
      }, 0);
      return wsInstance;
    });
    const whispers: Message[] = [];
    service.register('test', (message: Message) => {
      whispers.push(message);
    });
    service.messageQueue.setSendFunction(
      (message: string) =>
        new Promise<void>(resolve => {
          resolve(undefined);
        })
    );
    const timestamp = Date.now().toString();
    service.messageQueue.send('cmd');
    await service.messageQueue.processQueue();
    const testMessages = [
      createWhisperMessage('response', 'other_user'),
      createWhisperMessage('at', 'other_user'),
      createWhisperMessage(timestamp, 'other_user'),
    ];
    testMessages.forEach(message => messageCallback(message));
    await expect(service.lines.length).toBe(4);
    await expect(whispers[0].text).toBe('cmd');
    await expect(whispers[1].text).toBe('response');
    await expect(whispers[2].text).toBe('at');
    await expect(whispers[3].text).toBe(timestamp);
  });
});
