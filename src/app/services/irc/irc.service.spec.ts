import { ClassSpy, TestUtils } from 'src/test/test-utils';
import { client, Client, Options } from 'tmi.js';
import { Config } from '../data/config-data';
import { ConfigManager } from '../data/config-manager';
import { UserData } from '../user/user.data';
import { UserService } from '../user/user.service';
import { IrcService, Message } from './irc.service';

describe('IrcService', () => {
  let service: IrcService;
  let configManagerSpy: ClassSpy<ConfigManager>;
  let userServiceSpy: ClassSpy<UserService>;

  async function attachAndSend(
    message: string
  ): Promise<jasmine.SpyObj<Client>> {
    const clientInstance = jasmine.createSpyObj('Client', [
      'on',
      'connect',
      'whisper',
    ]);
    clientInstance.on.and.callFake((event: string, callback: Function) => {
      if (event === 'whisper') {
        callback('', null, message, false);
      }
    });
    await service.connectUsing((opts: Options) => {
      return clientInstance;
    });
    return clientInstance;
  }

  beforeEach(() => {
    configManagerSpy = TestUtils.spyOnClass(ConfigManager);
    const configData = new Config();
    configData.authentication.token = `token${Date.now()}`;
    configManagerSpy.getConfig.and.returnValue(configData);

    userServiceSpy = TestUtils.spyOnClass(UserService);
    const userData = {
      client_id: 'clientid',
      login: 'TestUser',
      user_id: 'userid',
      scopes: [],
    } as UserData;
    userServiceSpy.getUserInfo.and.returnValue(userData);

    service = new IrcService(
      configManagerSpy,
      userServiceSpy as jasmine.SpyObj<UserService>
    );
  });

  it('should connect to IRC', async () => {
    const queueSpy = spyOn(service.messageQueue, 'start');
    const sendFnSpy = spyOn(service.messageQueue, 'setSendFunction');
    const clientInstance = jasmine.createSpyObj('Client', ['on', 'connect']);
    const userData = userServiceSpy.getUserInfo();
    const configData = configManagerSpy.getConfig() as Config;
    let optsUsed: Options = {};
    await service.connectUsing((opts: Options) => {
      optsUsed = opts;
      return clientInstance;
    });
    expect(queueSpy).toHaveBeenCalled();
    expect(sendFnSpy).toHaveBeenCalled();
    expect(optsUsed).toBeTruthy();
    expect(optsUsed.options).toBeTruthy();
    expect(optsUsed.options!.clientId).toBe(userData.client_id);
    expect(optsUsed.identity).toBeTruthy();
    expect(optsUsed.identity!.username).toBe(userData.login);
    expect(optsUsed.identity!.password).toBe(
      `oauth:${configData.authentication.token}`
    );
    expect(clientInstance.connect).toHaveBeenCalled();
    const onCalls = clientInstance.on.calls.all();
    expect(onCalls.length).toBe(4);
    const toCall = ['raw_message', 'message', 'whisper', 'disconnected'];
    for (const onCall of onCalls) {
      expect(toCall).toContain(onCall.args[0]);
      expect(onCall.args[1]).toBeDefined();
      toCall.splice(toCall.indexOf(onCall.args[0]), 1);
    }
    expect(toCall).toEqual([]);
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
    const errorHandlerObj = { onError: (message: Message) => {} };
    const errorSpy = spyOn(errorHandlerObj, 'onError');
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandlerObj.onError);
    const clientInstance = jasmine.createSpyObj('Client', ['on', 'connect']);
    clientInstance.on.and.callFake((event: string, callback: Function) => {
      if (event === 'raw_message') {
        callback({
          tags: { 'msg-id': 'whisper_restricted' },
          command: 'NOTICE',
          params: ['test'],
        });
      }
    });
    await service.connectUsing((opts: Options) => {
      return clientInstance;
    });
    expect(errorSpy).toHaveBeenCalled();
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
    attachAndSend('test');
    service.send('test');
    service.messageQueue.setSendFunction((account: string, message: string) => {
      return new Promise<[string, string]>(resolve => {});
    });
    await service.messageQueue.processQueue();
    expect(callbackSpy).toHaveBeenCalled();
  });

  it('should not overwrite whisper handlers with the same key by default', () => {
    const callback = (message: Message) => {};
    const callback2 = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    service.register(handlerKey, callback2);
    const callbacks = service.callbacks;
    expect(callbacks.get(handlerKey)).toBe(callback);
    expect(callbacks.get(handlerKey)).not.toBe(callback2);
  });

  it('should overwrite whisper handlers with the same key when forced', () => {
    const callback = (message: Message) => {};
    const callback2 = (message: Message) => {};
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    service.register(handlerKey, callback2, true);
    const callbacks = service.callbacks;
    expect(callbacks.get(handlerKey)).toBe(callback2);
    expect(callbacks.get(handlerKey)).not.toBe(callback);
  });

  it('should send queued messages', async () => {
    const message = `test message sent at ${Date.now()}`;
    const sendFn = {
      send: async (account: string, message: string) => {
        return new Promise<[string, string]>(resolve => {
          resolve(['', '']);
        });
      },
    };
    const spy = spyOn(sendFn, 'send');
    service.send(message);
    service.messageQueue.setSendFunction(sendFn.send);
    await service.messageQueue.processQueue();
    expect(spy).toHaveBeenCalled();
    const call = spy.calls.mostRecent();
    expect(call.args[1]).toBe(message);
  });

  it('should properly format messages', async () => {
    const clientInstance = jasmine.createSpyObj('Client', ['on', 'connect']);
    let whisperCallback: Function = () => {};
    clientInstance.on.and.callFake((event: string, callback: Function) => {
      if (event === 'whisper') {
        whisperCallback = callback;
      }
    });
    await service.connectUsing((opts: Options) => {
      return clientInstance;
    });

    const whispers: Message[] = [];
    service.register('test', (message: Message) => {
      whispers.push(message);
    });

    const timestamp = Date.now().toString();
    whisperCallback.call(service, '', null, 'cmd', true);
    whisperCallback.call(service, '', null, 'response', false);
    whisperCallback.call(service, '', null, 'cmd', true);
    whisperCallback.call(service, '', null, 'at', false);
    whisperCallback.call(service, '', null, timestamp, false);

    expect(service.lines.length).toBe(3);
    expect(whispers[0].text).toBe('response');
    expect(whispers[1].text).toBe('at');
    expect(whispers[2].text).toBe(timestamp);
  });

  it('should handle sends from the message queue', async () => {
    const clientInstance = jasmine.createSpyObj('Client', ['on', 'connect']);
    let whisperCallback: Function = () => {};
    clientInstance.on.and.callFake((event: string, callback: Function) => {
      if (event === 'whisper') {
        whisperCallback = callback;
      }
    });
    await service.connectUsing((opts: Options) => {
      return clientInstance;
    });

    const whispers: Message[] = [];
    service.register('test', (message: Message) => {
      whispers.push(message);
    });
    service.messageQueue.setSendFunction((account: string, message: string) => {
      return new Promise<[string, string]>(resolve => {
        resolve(['from', 'message']);
      });
    });

    const timestamp = Date.now().toString();
    service.messageQueue.send('cmd');
    await service.messageQueue.processQueue();
    whisperCallback.call(service, '', null, 'response', false);
    whisperCallback.call(service, '', null, 'at', false);
    whisperCallback.call(service, '', null, timestamp, false);

    expect(service.lines.length).toBe(4);
    expect(whispers[0].text).toBe('cmd');
    expect(whispers[1].text).toBe('response');
    expect(whispers[2].text).toBe('at');
    expect(whispers[3].text).toBe(timestamp);
  });
});
