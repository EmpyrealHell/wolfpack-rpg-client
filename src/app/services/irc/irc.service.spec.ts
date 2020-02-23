import { Options } from 'tmi.js';
import { Config } from '../data/config-data';
import { UserData } from '../user/user.data';
import { IrcService } from './irc.service';

const configManagerSpy = jasmine.createSpyObj('ConfigManager', ['GetConfig']);
const configData = new Config();
configData.Authentication.Token = `token${Date.now()}`;
configManagerSpy.GetConfig.and.returnValue(configData);
const userServiceSpy = jasmine.createSpyObj('UserService', ['GetUserInfo']);
const userData = {
  client_id: 'clientid',
  login: 'TestUser',
  user_id: 'userid',
  scopes: []
} as UserData;
userServiceSpy.GetUserInfo.and.returnValue(userData);

let service: IrcService;

const messageQueueKey = 'messageQueue';
const linesKey = 'lines';
const historyKey = 'history';
const errorHandlersKey = 'errorHandlers';
const onErrorKey = 'onError';
const callbacksKey = 'callbacks';
const onWhisperKey = 'onWhisper';
const connectionKey = 'connection';
const secondtimerKey = 'secondTimer';
const minuteTimerKey = 'minuteTimer';
const processQueueKey = 'processQueue';

describe('IrcService', () => {
  beforeEach(() => {
    service = new IrcService(configManagerSpy, userServiceSpy);
    IrcService.reset();
  });

  it('should connect to IRC', async () => {
    const queueSpy = spyOn<any>(IrcService, 'processQueue');
    const clientInstance = jasmine.createSpyObj('Client', ['on', 'connect']);
    let optsUsed: Options;
    await service.connectUsing((opts: Options) => {
      optsUsed = opts;
      return clientInstance;
    });
    expect(queueSpy).toHaveBeenCalled();
    expect(optsUsed.options.clientId).toBe(userData.client_id);
    expect(optsUsed.identity.username).toBe(userData.login);
    expect(optsUsed.identity.password).toBe(`oauth:${configData.Authentication.Token}`);
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

  it('should queue messages to send', () => {
    const queue = IrcService[messageQueueKey];
    const message = `test${Date.now()}`;
    service.send(message);
    expect(queue).toContain(message);
    expect(queue.length).toBe(1);
  });

  it('should not queue duplicate messages', () => {
    const queue = IrcService[messageQueueKey];
    const message = `test${Date.now()}`;
    service.send(message);
    service.send(message);
    expect(queue.length).toBe(1);
  });

  it('should return a copy of the queued messages', () => {
    const queue = IrcService[messageQueueKey];
    const message = `test message at ${Date.now()}`;
    queue.push(message);
    let queueCopy = service.getQueuedMessages();
    expect(queueCopy).toContain(message);
    queueCopy.length = 0;
    queueCopy = service.getQueuedMessages();
    expect(queueCopy).toContain(message);
  });

  it('should return a copy of received messages', () => {
    const lines = IrcService[linesKey];
    const message = `test message at ${Date.now()}`;
    lines.push(message);
    let linesCopy = service.getLines();
    expect(linesCopy).toContain(message);
    linesCopy.length = 0;
    linesCopy = service.getLines();
    expect(linesCopy).toContain(message);
  });

  it('should return the full history', () => {
    const message = `test message at ${Date.now()}`;
    IrcService[historyKey] = message;
    expect(service.getHistory()).toBe(message);
  });

  it('should register an error handler for an id', () => {
    const errorHandler = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    const errorHandlers = IrcService[errorHandlersKey];
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
  });

  it('should remove an error handler for an id', () => {
    const errorHandler = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    const errorHandlers = IrcService[errorHandlersKey];
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
    service.unregisterForError(handlerKey);
    expect(errorHandlers.has(handlerKey)).toBeFalsy();
  });

  it('should call registered error handlers on error', () => {
    const errorHandlerObj = { onError: (message: string) => { } };
    const errorSpy = spyOn(errorHandlerObj, 'onError');
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandlerObj.onError);
    service[onErrorKey]('');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should not overwrite error handlers with the same key by default', () => {
    const errorHandler = (message: string) => { };
    const errorHandler2 = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    service.registerForError(handlerKey, errorHandler2);
    const errorHandlers = IrcService[errorHandlersKey];
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
    expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler2);
  });

  it('should overwrite error handlers with the same key when forced', () => {
    const errorHandler = (message: string) => { };
    const errorHandler2 = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.registerForError(handlerKey, errorHandler);
    service.registerForError(handlerKey, errorHandler2, true);
    const errorHandlers = IrcService[errorHandlersKey];
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler2);
    expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler);
  });

  it('should register a whisper handler for an id', () => {
    const callback = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    const callbacks = IrcService[callbacksKey];
    expect(callbacks.get(handlerKey)).toBe(callback);
  });

  it('should remove a whisper handler for an id', () => {
    const callback = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    const callbacks = IrcService[callbacksKey];
    expect(callbacks.get(handlerKey)).toBe(callback);
    service.unregister(handlerKey);
    expect(callbacks.has(handlerKey)).toBeFalsy();
  });

  it('should call registered callbacks on whisper', () => {
    const callbackObj = { onWhisper: (message: string) => { } };
    const callbackSpy = spyOn(callbackObj, 'onWhisper');
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callbackObj.onWhisper);
    service[onWhisperKey]('');
    expect(callbackSpy).toHaveBeenCalled();
  });

  it('should not overwrite whisper handlers with the same key by default', () => {
    const callback = (message: string) => { };
    const callback2 = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    service.register(handlerKey, callback2);
    const callbacks = IrcService[callbacksKey];
    expect(callbacks.get(handlerKey)).toBe(callback);
    expect(callbacks.get(handlerKey)).not.toBe(callback2);
  });

  it('should overwrite whisper handlers with the same key when forced', () => {
    const callback = (message: string) => { };
    const callback2 = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.register(handlerKey, callback);
    service.register(handlerKey, callback2, true);
    const callbacks = IrcService[callbacksKey];
    expect(callbacks.get(handlerKey)).toBe(callback2);
    expect(callbacks.get(handlerKey)).not.toBe(callback);
  });

  it('should send queued messages', async () => {
    const clientInstance = jasmine.createSpyObj('Client', ['whisper']);
    IrcService[connectionKey] = clientInstance;
    const message = `test message sent at ${Date.now()}`;
    IrcService.isConnected = true;
    IrcService[messageQueueKey].length = 0;

    service.send(message);
    await IrcService[processQueueKey](false);
    expect(clientInstance.whisper).toHaveBeenCalled();
    const call = clientInstance.whisper.calls.mostRecent();
    expect(call.args[1]).toBe(message);
  });

  it('should not send more than 3 messages each second', async () => {
    const clientInstance = jasmine.createSpyObj('Client', ['whisper']);
    IrcService[connectionKey] = clientInstance;
    const message = `test message sent at ${Date.now()}`;
    IrcService.isConnected = true;
    const timer = IrcService[secondtimerKey];
    for (let i = 0; i < 3; i++) {
      timer.addOccurrence();
    }

    service.send(message);
    await IrcService[processQueueKey](false);
    expect(clientInstance.whisper).not.toHaveBeenCalled();
  });

  it('should not send more than 100 messages each minute', async () => {
    const clientInstance = jasmine.createSpyObj('Client', ['whisper']);
    IrcService[connectionKey] = clientInstance;
    const message = `test message sent at ${Date.now()}`;
    IrcService.isConnected = true;
    const timer = IrcService[minuteTimerKey];
    for (let i = 0; i < 100; i++) {
      timer.addOccurrence();
    }

    service.send(message);
    await IrcService[processQueueKey](false);
    expect(clientInstance.whisper).not.toHaveBeenCalled();
  });
});
