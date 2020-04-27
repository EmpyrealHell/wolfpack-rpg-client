import { ClassSpy, TestUtils } from 'src/test/test-utils';
import { Client, Options } from 'tmi.js';
import { Config } from '../data/config-data';
import { ConfigManager } from '../data/config-manager';
import { UserData } from '../user/user.data';
import { UserService } from '../user/user.service';
import { IrcService } from './irc.service';

describe('IrcService', () => {
  let service: IrcService;
  let configManagerSpy: ClassSpy<ConfigManager>;
  let userServiceSpy: ClassSpy<UserService>;

  async function attachAndSend(
    message: string
  ): Promise<jasmine.SpyObj<Client>> {
    const clientInstance = jasmine.createSpyObj('Client', ['on', 'connect']);
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

  it('should return a copy of received messages', async () => {
    const message = `test message at ${Date.now()}`;
    await attachAndSend(message);
    let linesCopy = service.lines;
    expect(linesCopy).toContain(message);
    linesCopy.length = 0;
    linesCopy = service.lines;
    expect(linesCopy).toContain(message);
  });

  it('should return the full history', async () => {
    const message = `test message at ${Date.now()}`;
    await attachAndSend(message);
    expect(service.history).toBe(`${message}\n`);
  });

  it('should register an error handler for an id', () => {
    const errorHandler = (message: string) => {};
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    const errorHandlers = service.errorHandlers;
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
  });

  it('should remove an error handler for an id', () => {
    const errorHandler = (message: string) => {};
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    expect(service.errorHandlers.get(handlerKey)).toBe(errorHandler);
    service.unregisterForError(handlerKey);
    expect(service.errorHandlers.has(handlerKey)).toBeFalsy();
  });

  it('should call registered error handlers on error', async () => {
    const errorHandlerObj = { onError: (message: string) => {} };
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
    const errorHandler = (message: string) => {};
    const errorHandler2 = (message: string) => {};
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    service.registerForError(handlerKey, errorHandler2);
    const errorHandlers = service.errorHandlers;
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
    expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler2);
  });

  it('should overwrite error handlers with the same key when forced', () => {
    const errorHandler = (message: string) => {};
    const errorHandler2 = (message: string) => {};
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    service.registerForError(handlerKey, errorHandler2, true);
    const errorHandlers = service.errorHandlers;
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler2);
    expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler);
  });

  it('should register a whisper handler for an id', () => {
    const callback = (message: string) => {};
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    expect(service.callbacks.get(handlerKey)).toBe(callback);
  });

  it('should remove a whisper handler for an id', () => {
    const callback = (message: string) => {};
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    expect(service.callbacks.get(handlerKey)).toBe(callback);
    service.unregister(handlerKey);
    expect(service.callbacks.has(handlerKey)).toBeFalsy();
  });

  it('should call registered callbacks on whisper', async () => {
    const callbackObj = { onWhisper: (message: string) => {} };
    const callbackSpy = spyOn(callbackObj, 'onWhisper');
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callbackObj.onWhisper);
    attachAndSend('test');
    service.send('test');
    await service.messageQueue.processQueue();
    expect(callbackSpy).toHaveBeenCalled();
  });

  it('should not overwrite whisper handlers with the same key by default', () => {
    const callback = (message: string) => {};
    const callback2 = (message: string) => {};
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    service.register(handlerKey, callback2);
    const callbacks = service.callbacks;
    expect(callbacks.get(handlerKey)).toBe(callback);
    expect(callbacks.get(handlerKey)).not.toBe(callback2);
  });

  it('should overwrite whisper handlers with the same key when forced', () => {
    const callback = (message: string) => {};
    const callback2 = (message: string) => {};
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

    const whispers: string[] = [];
    service.register('test', (message: string) => {
      whispers.push(message);
    });

    const timestamp = Date.now().toString();
    whisperCallback.call(service, '', null, 'cmd', true);
    whisperCallback.call(service, '', null, 'response', false);
    whisperCallback.call(service, '', null, 'cmd', true);
    whisperCallback.call(service, '', null, 'at', false);
    whisperCallback.call(service, '', null, timestamp, false);

    expect(service.history).toBe(
      `>> cmd\nresponse\n\n>> cmd\nat\n${timestamp}\n`
    );
    expect(service.lines.length).toBe(5);
    expect(whispers[0]).toBe('>> cmd');
    expect(whispers[1]).toBe('response');
    expect(whispers[2]).toBe('\n>> cmd');
    expect(whispers[3]).toBe('at');
    expect(whispers[4]).toBe(timestamp);
  });
});
