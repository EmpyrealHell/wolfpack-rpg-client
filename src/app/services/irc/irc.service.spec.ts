import { IrcService } from './irc.service';
import { Config } from '../data/config-data';
import { UserData } from '../user/user.data';
import { Options, Client } from 'tmi.js';

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

const messageQueueKey = 'messageQueue';
const linesKey = 'lines';
const historyKey = 'history';
const errorHandlersKey = 'errorHandlers';
const onErrorKey = 'onError';
const callbacksKey = 'callbacks';
const onWhisperKey = 'onWhisper';

fdescribe('IrcService', () => {
  it('should connect to IRC', async () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const queueSpy = spyOn<any>(IrcService, 'processQueue');
    const clientInstance = jasmine.createSpyObj('Client', ['on', 'connect']);
    let optsUsed: Options;
    await service.ConnectUsing((opts: Options) => {
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
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const queue = IrcService[messageQueueKey];
    const message = `test${Date.now()}`;
    service.Send(message);
    expect(queue).toContain(message);
    expect(queue.length).toBe(1);
    queue.length = 0;
  });

  it('should not queue duplicate messages', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const queue = IrcService[messageQueueKey];
    const message = `test${Date.now()}`;
    service.Send(message);
    service.Send(message);
    expect(queue.length).toBe(1);
    queue.length = 0;
  });

  it('should return a copy of the queued messages', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const queue = IrcService[messageQueueKey];
    const message = `test message at ${Date.now()}`;
    queue.push(message);
    let queueCopy = service.GetQueuedMessages();
    expect(queueCopy).toContain(message);
    queueCopy.length = 0;
    queueCopy = service.GetQueuedMessages();
    expect(queueCopy).toContain(message);
    queue.length = 0;
  });

  it('should return a copy of received messages', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const lines = IrcService[linesKey];
    const message = `test message at ${Date.now()}`;
    lines.push(message);
    let linesCopy = service.GetLines();
    expect(linesCopy).toContain(message);
    linesCopy.length = 0;
    linesCopy = service.GetLines();
    expect(linesCopy).toContain(message);
    lines.length = 0;
  });

  it('should return the full history', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const message = `test message at ${Date.now()}`;
    IrcService[historyKey] = message;
    expect(service.GetHistory()).toBe(message);
    IrcService[historyKey] = '';
  });

  it('should register an error handler for an id', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const errorHandler = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.RegisterForError(handlerKey, errorHandler);
    const errorHandlers = IrcService[errorHandlersKey];
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
    errorHandlers.delete(handlerKey);
  });

  it('should remove an error handler for an id', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const errorHandler = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.RegisterForError(handlerKey, errorHandler);
    const errorHandlers = IrcService[errorHandlersKey];
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
    service.UnregisterForError(handlerKey);
    expect(errorHandlers.has(handlerKey)).toBeFalsy();
  });

  it('should call registered error handlers on error', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const errorHandlerObj = { onError: (message: string) => { } };
    const errorSpy = spyOn(errorHandlerObj, 'onError');
    const handlerKey = `test-${Date.now()}`;
    service.RegisterForError(handlerKey, errorHandlerObj.onError);
    service[onErrorKey]('');
    expect(errorSpy).toHaveBeenCalled();
    service.UnregisterForError(handlerKey);
  });

  it('should not overwrite error handlers with the same key by default', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const errorHandler = (message: string) => { };
    const errorHandler2 = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.RegisterForError(handlerKey, errorHandler);
    service.RegisterForError(handlerKey, errorHandler2);
    const errorHandlers = IrcService[errorHandlersKey];
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler);
    expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler2);
    errorHandlers.delete(handlerKey);
  });

  it('should overwrite error handlers with the same key when forced', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const errorHandler = (message: string) => { };
    const errorHandler2 = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.RegisterForError(handlerKey, errorHandler);
    service.RegisterForError(handlerKey, errorHandler2, true);
    const errorHandlers = IrcService[errorHandlersKey];
    expect(errorHandlers.get(handlerKey)).toBe(errorHandler2);
    expect(errorHandlers.get(handlerKey)).not.toBe(errorHandler);
    errorHandlers.delete(handlerKey);
  });

  it('should register a whisper handler for an id', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const callback = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.Register(handlerKey, callback);
    const callbacks = IrcService[callbacksKey];
    expect(callbacks.get(handlerKey)).toBe(callback);
    callbacks.delete(handlerKey);
  });

  it('should remove a whisper handler for an id', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const callback = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.Register(handlerKey, callback);
    const callbacks = IrcService[callbacksKey];
    expect(callbacks.get(handlerKey)).toBe(callback);
    service.Unregister(handlerKey);
    expect(callbacks.has(handlerKey)).toBeFalsy();
  });

  it('should call registered callbacks on whisper', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const callbackObj = { onWhisper: (message: string) => { } };
    const callbackSpy = spyOn(callbackObj, 'onWhisper');
    const handlerKey = `test-${Date.now()}`;
    service.Register(handlerKey, callbackObj.onWhisper);
    service[onWhisperKey]('');
    expect(callbackSpy).toHaveBeenCalled();
    service.Unregister(handlerKey);
  });

  it('should not overwrite whisper handlers with the same key by default', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const callback = (message: string) => { };
    const callback2 = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.Register(handlerKey, callback);
    service.Register(handlerKey, callback2);
    const callbacks = IrcService[callbacksKey];
    expect(callbacks.get(handlerKey)).toBe(callback);
    expect(callbacks.get(handlerKey)).not.toBe(callback2);
    callbacks.delete(handlerKey);
  });

  it('should overwrite whisper handlers with the same key when forced', () => {
    const service = new IrcService(configManagerSpy, userServiceSpy);
    const callback = (message: string) => { };
    const callback2 = (message: string) => { };
    const handlerKey = `test-${Date.now()}`;
    service.Register(handlerKey, callback);
    service.Register(handlerKey, callback2, true);
    const callbacks = IrcService[callbacksKey];
    expect(callbacks.get(handlerKey)).toBe(callback2);
    expect(callbacks.get(handlerKey)).not.toBe(callback);
    callbacks.delete(handlerKey);
  });

  /// Tests for processQueue
});
