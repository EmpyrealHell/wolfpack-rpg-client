import { TestUtils } from 'src/test/test-utils';
import { CommandLoader } from './command-loader';

describe('CommandLoader', () => {
  const loader = new CommandLoader();

  beforeAll(async () => {
    loader.load();
  });

  it('should load the command data json', async () => {
    const messageList = loader.all;
    await expect(messageList.length).toBe(129);
  });

  it('should provide access to keys', async () => {
    const message = 'command.chat.message.success';
    const matchGroup = loader.get(message);
    await expect(matchGroup).not.toBeUndefined();
    if (matchGroup) {
      await expect(matchGroup.get('confirmation')).not.toBeUndefined();
    }
  });
});
