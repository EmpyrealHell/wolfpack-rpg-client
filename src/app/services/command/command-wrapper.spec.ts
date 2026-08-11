import * as CommandData from './command-data.json';
import { CommandWrapper } from './command-wrapper';

export class ConcreteCommandWrapper extends CommandWrapper {}

describe('CommandWrapper', () => {
  const wrapper = new ConcreteCommandWrapper();

  it('should get command strings', async () => {
    const commandString = wrapper.getCommandString(
      'chat',
      'message',
      'command'
    );
    await expect(commandString).toBe(CommandData.commands.chat.message.command);
  });

  it('should wrap properties to match json', async () => {
    const property = 'message';
    const wrapped = wrapper.key(property);
    await expect(wrapped).toBe(`{${property}}`);
  });

  it('should replace a property in a string', async () => {
    const message = 'message {first}';
    const replaced = wrapper.replaceProperty(message, 'first', 'replaced');
    await expect(replaced).toBe('message replaced');
  });

  it('should replace properties in a string', async () => {
    const message = 'messages {first} {second}';
    const replaced = wrapper.replaceProperties(message, {
      first: 'both',
      second: 'replaced',
    });
    await expect(replaced).toBe('messages both replaced');
  });
});
