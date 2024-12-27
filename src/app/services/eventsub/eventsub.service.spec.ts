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
  let service: EventSubService;
  let configManagerSpy: ClassSpy<ConfigManager>;
  let userServiceSpy: ClassSpy<UserService>;
  let whisperServiceSpy: ClassSpy<WhisperService>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

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
    return {
      data: JSON.stringify({
        metadata: {
          message_type: 'notification',
          subscription_type: 'channel.chat.message',
        },
        payload: {
          event: {
            broadcaster_login: eventSubConfig.streamerAccount,
            chatter_login: eventSubConfig.botAccount,
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
    ]);

    const connectPromise = service.connectUsing(() => {
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
    const queueSpy = spyOn(service.messageQueue, 'start');
    const sendFnSpy = spyOn(service.messageQueue, 'setSendFunction');
    const wsInstance = jasmine.createSpyObj('WebSocket', [
      'onopen',
      'onmessage',
      'onclose',
      'onerror',
    ]);
    const connectPromise = service.connectUsing(() => {
      setTimeout(() => {
        if (wsInstance.onopen) {
          wsInstance.onopen({} as Event);
        }
        if (wsInstance.onmessage) {
          wsInstance.onmessage(createWelcomeMessage());
        }
      }, 0);
      return wsInstance;
    });

    const result = await connectPromise;
    expect(result).toBe(true);
    expect(service.isConnected).toBe(true);
    expect(queueSpy).toHaveBeenCalled();
    expect(sendFnSpy).toHaveBeenCalled();
    expect(service.connection).toBeTruthy();
  });

  it('should return an array of received messages', async () => {
    const message = `test message at ${Date.now()}`;
    await attachAndSend(message);
    expect(service.lines.filter(x => x.text === message)).toBeTruthy();
  });

  it('should return the full history', async () => {
    const message = `test message at ${Date.now()}`;
    await attachAndSend(message);
    expect(service.lines.map(x => x.text)).toContain(message);
  });

  it('should register an error handler for an id', () => {
    const errorHandler = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    const errorHandlers = service.errorHandlers;
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
  });

  it('should remove an error handler for an id', () => {
    const errorHandler = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    expect(service.errorHandlers.get(handlerKey)).toBe(errorHandler);
    service.unregisterForError(handlerKey);
    expect(service.errorHandlers.has(handlerKey)).toBeFalsy();
  });

  it('should call registered error handlers on error', async () => {
    const consoleSpy = spyOn(console, 'error'); // supress expected error message in terminal
    const errorHandlerObj = { onError: (message: Message) => {} };
    const errorSpy = spyOn(errorHandlerObj, 'onError');
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandlerObj.onError);
    const wsInstance = jasmine.createSpyObj('WebSocket', [
      'onopen',
      'onmessage',
      'onclose',
      'onerror',
    ]);
    const connectPromise = service.connectUsing(() => {
      setTimeout(() => {
        if (wsInstance.onerror) {
          wsInstance.onerror(new Error('WebSocket Error'));
        }
      }, 0);
      return wsInstance;
    });

    await connectPromise;
    expect(errorSpy).toHaveBeenCalled();
    consoleSpy.calls.reset();
  });

  it('should not overwrite error handlers with the same key by default', () => {
    const errorHandler = (message: Message) => {};
    const errorHandler2 = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    service.registerForError(handlerKey, errorHandler2);
    const errorHandlers = service.errorHandlers;
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
    expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler2);
  });

  it('should overwrite error handlers with the same key when forced', () => {
    const errorHandler = (message: Message) => {};
    const errorHandler2 = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    service.registerForError(handlerKey, errorHandler2, true);
    const errorHandlers = service.errorHandlers;
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler2);
    expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler);
  });

  it('should register a whisper handler for an id', () => {
    const callback = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    expect(service.callbacks.get(handlerKey)).toBe(callback);
  });

  it('should remove a whisper handler for an id', () => {
    const callback = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    expect(service.callbacks.get(handlerKey)).toBe(callback);
    service.unregister(handlerKey);
    expect(service.callbacks.has(handlerKey)).toBeFalsy();
  });

  it('should call registered callbacks on whisper', async () => {
    const callbackObj = { onWhisper: (message: Message) => {} };
    const callbackSpy = spyOn(callbackObj, 'onWhisper');
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callbackObj.onWhisper);
    const wsInstance = jasmine.createSpyObj('WebSocket', [
      'onopen',
      'onmessage',
      'onclose',
      'onerror',
    ]);
    const connectPromise = service.connectUsing(() => {
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
    expect(callbackSpy).toHaveBeenCalled();
  });

  it('should not overwrite whisper handlers with the same key by default', () => {
    const callback = (message: Message) => {};
    const callback2 = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    service.register(handlerKey, callback2);
    expect(service.callbacks.get(handlerKey)).toBe(callback);
    expect(service.callbacks.get(handlerKey)).not.toBe(callback2);
  });

  it('should overwrite whisper handlers with the same key when forced', () => {
    const callback = (message: Message) => {};
    const callback2 = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    service.register(handlerKey, callback2, true);
    expect(service.callbacks.get(handlerKey)).toBe(callback2);
    expect(service.callbacks.get(handlerKey)).not.toBe(callback);
  });

  it('should send queued messages', async () => {
    const message = `test message sent at ${Date.now()}`;
    const sendFn = {
      send: async (message: string) => {
        return new Promise<void>(resolve => {
          resolve(undefined);
        });
      },
    };
    const spy = spyOn(sendFn, 'send');
    service.send(message);
    service.messageQueue.setSendFunction(sendFn.send);
    await service.messageQueue.processQueue();
    expect(spy).toHaveBeenCalled();
    const call = spy.calls.mostRecent();
    expect(call.args[0]).toBe(message);
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
    await service.connectUsing(() => {
      return wsInstance;
    });
    await new Promise(resolve => setTimeout(resolve, 0));
    const whispers: Message[] = [];
    service.register('test', (message: Message) => {
      whispers.push(message);
    });
    const timestamp = Date.now().toString();
    const userData = await userServiceSpy.getUserAuth();
    messageHandler(createWelcomeMessage());
    messageHandler(createWhisperMessage('cmd', userData.user_id));
    messageHandler(createWhisperMessage('response', 'other_user'));
    messageHandler(createWhisperMessage('cmd', userData.user_id));
    messageHandler(createWhisperMessage('at', 'other_user'));
    messageHandler(createWhisperMessage(timestamp, 'other_user'));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(service.lines.length).toBe(3);
    expect(whispers[0].text).toBe('response');
    expect(whispers[1].text).toBe('at');
    expect(whispers[2].text).toBe(timestamp);
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
    service.messageQueue.setSendFunction((message: string) => {
      return new Promise<void>(resolve => {
        resolve(undefined);
      });
    });
    const timestamp = Date.now().toString();
    service.messageQueue.send('cmd');
    await service.messageQueue.processQueue();
    const testMessages = [
      createWhisperMessage('response', 'other_user'),
      createWhisperMessage('at', 'other_user'),
      createWhisperMessage(timestamp, 'other_user'),
    ];
    testMessages.forEach(message => messageCallback(message));
    expect(service.lines.length).toBe(4);
    expect(whispers[0].text).toBe('cmd');
    expect(whispers[1].text).toBe('response');
    expect(whispers[2].text).toBe('at');
    expect(whispers[3].text).toBe(timestamp);
  });
});
