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
});
