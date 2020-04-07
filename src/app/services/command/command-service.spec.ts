import { TestUtils } from 'src/test/test-utils';
import { IrcService } from '../irc/irc.service';
import { CommandService } from './command-service';

describe('CommandWrapper', () => {
  let ircService: IrcService;
  let service: CommandService;

  beforeAll(async () => {
    ircService = (TestUtils.spyOnClass(
      IrcService
    ) as unknown) as jasmine.SpyObj<IrcService>;
    service = new CommandService(ircService);
  });

  it('should send chat messages to party', () => {
    service.chat.message('test');
    expect(ircService.send).toHaveBeenCalledWith('/p test');
  });

  it('should load the command data json', () => {
    const messageList = service.messageList;
    expect(messageList.length).toBe(186);
  });

  it('should call a method on a matching message', () => {
    const callback = {
      fn: (name: string, id: string, groups: Array<Map<string, string>>) => {},
    };
    const spy = spyOn(callback, 'fn');
    service.subscribeToMessage('party', 'full', spy);
    service.onIncomingWhisper('Your party is now full.');
    expect(spy).toHaveBeenCalled();
  });

  it('should not call a method on a non-matching message', () => {
    const callback = {
      fn: (name: string, id: string, groups: Array<Map<string, string>>) => {},
    };
    const spy = spyOn(callback, 'fn');
    service.subscribeToMessage('party', 'full', spy);
    service.onIncomingWhisper('Your party is full.');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should provide the captured groups', () => {
    const callback = {
      fn: (name: string, id: string, groups: Array<Map<string, string>>) => {},
    };
    const spy = spyOn(callback, 'fn');
    service.subscribeToMessage('party', 'declined', spy);
    service.onIncomingWhisper('Foo has declined your party invite.');
    const map = new Map<string, string>();
    map.set('user', 'Foo');
    expect(spy).toHaveBeenCalledWith('message.party.declined', '', [map]);
  });
});
