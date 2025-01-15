import { TestUtils } from 'src/test/test-utils';
import { CommandLoader } from './command-loader';

describe('CommandLoader', () => {
  const loader = new CommandLoader();

  beforeAll(async () => {
    loader.load();
  });

  it('should load the command data json', () => {
    const messageList = loader.all;
    expect(messageList.length).toBe(129);
  });

  it('should provide access to keys', () => {
    const message = 'command.chat.message.success';
    const matchGroup = loader.get(message);
    expect(matchGroup).not.toBeUndefined();
    if (matchGroup) {
      expect(matchGroup.get('confirmation')).not.toBeUndefined();
    }
  });
});
