import { TestUtils } from 'src/test/test-utils';
import { IrcService, Message } from '../irc/irc.service';
import { CommandService } from './command-service';

describe('CommandService', () => {
  let ircService: IrcService;
  let service: CommandService;

  beforeAll(async () => {
    ircService = (TestUtils.spyOnClass(
      IrcService
    ) as unknown) as jasmine.SpyObj<IrcService>;
    service = new CommandService(ircService);
    service.initialize();
  });

  it('should send chat messages to party', () => {
    expect(service.chat).not.toBeUndefined();
    if (service.chat) {
      service.chat.message('test');
      expect(ircService.send).toHaveBeenCalledWith('/p test');
    }
  });

  it('should call a method on a matching message', () => {
    const callback = {
      fn: (name: string, id: string, groups: Array<Map<string, string>>) => {},
    };
    const spy = spyOn(callback, 'fn');
    service.subscribeToMessage('party', 'full', 'test', spy);
    service.onIncomingWhisper(
      new Message('Your party is now full.', true, true)
    );
    expect(spy).toHaveBeenCalled();
  });

  it('should not call a method on a non-matching message', () => {
    const callback = {
      fn: (name: string, id: string, groups: Array<Map<string, string>>) => {},
    };
    const spy = spyOn(callback, 'fn');
    service.subscribeToMessage('party', 'full', 'test', spy);
    service.onIncomingWhisper(new Message('Your party is full.', true, true));
    expect(spy).not.toHaveBeenCalled();
  });

  it('should provide the captured groups', () => {
    const callback = {
      fn: (name: string, id: string, groups: Array<Map<string, string>>) => {},
    };
    const spy = spyOn(callback, 'fn');
    service.subscribeToMessage('party', 'declined', 'test', spy);
    const now = Date.now();
    service.onIncomingWhisper(
      new Message('Foo has declined your party invite.', true, true)
    );
    const map = new Map<string, string>();
    map.set('user', 'Foo');
    expect(spy).toHaveBeenCalledWith(
      'message.party.declined',
      'declined',
      map,
      [],
      now
    );
  });
});
