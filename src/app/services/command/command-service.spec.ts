import { TestUtils } from 'src/test/test-utils';
import { CommandService } from './command-service';
import { EventSubService, Message } from '../eventsub/eventsub.service';

describe('CommandService', () => {
  let eventSubService: EventSubService, service: CommandService;

  beforeAll(async () => {
    eventSubService = TestUtils.spyOnClass(
      EventSubService
    ) as unknown as jasmine.SpyObj<EventSubService>;
    service = new CommandService(eventSubService);
    service.initialize();
  });

  it('should send chat messages to party', async () => {
    await expect(service.chat).not.toBeUndefined();
    if (service.chat) {
      service.chat.message('test');
      await expect(eventSubService.send).toHaveBeenCalledWith('/p test');
    }
  });

  it('should call a method on a matching message', async () => {
    const callback = {
        fn: (_name: string, _id: string, _groups: Map<string, string>) => {},
      },
      spy = spyOn(callback, 'fn');
    service.subscribeToMessage('party', 'full', 'test', spy);
    service.onIncomingWhisper(
      new Message('Your party is now full.', true, true)
    );
    await expect(spy).toHaveBeenCalled();
  });

  it('should not call a method on a non-matching message', async () => {
    const callback = {
        fn: (_name: string, _id: string, _groups: Map<string, string>) => {},
      },
      spy = spyOn(callback, 'fn');
    service.subscribeToMessage('party', 'full', 'test', spy);
    service.onIncomingWhisper(new Message('Your party is full.', true, true));
    await expect(spy).not.toHaveBeenCalled();
  });

  it('should provide the captured groups', async () => {
    const callback = {
        fn: (
          _name: string,
          _id: string,
          _groups: Map<string, string>,
          _subGroups: Map<string, string>[],
          _date: number
        ) => {},
      },
      spy = spyOn(callback, 'fn');
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
