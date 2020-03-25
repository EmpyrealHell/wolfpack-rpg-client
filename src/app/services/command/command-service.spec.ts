import { TestUtils } from 'src/test/test-utils';
import { Options } from 'tmi.js';
import { Config } from '../data/config-data';
import { ConfigManager } from '../data/config-manager';
import { IrcService } from '../irc/irc.service';
import { UserData } from '../user/user.data';
import { UserService } from '../user/user.service';
import { CommandService } from './command-service';

fdescribe('CommandWrapper', () => {
  let ircService: IrcService;
  let service: CommandService;

  beforeAll(async () => {
    ircService = (TestUtils.spyOnClass(
      IrcService
    ) as unknown) as jasmine.SpyObj<IrcService>;
    service = new CommandService(ircService);
  });

  it('should send chat messages to party', () => {
    service.sendChatMessage('test');
    expect(ircService.send).toHaveBeenCalledWith('/p test');
  });
});
