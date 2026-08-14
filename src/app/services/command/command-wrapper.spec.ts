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
      ),
      data = CommandData;
    await expect(commandString).toBe(data.commands.chat.message.command);
  });

  it('should wrap properties to match json', async () => {
    const property = 'message',
      wrapped = wrapper.key(property);
    await expect(wrapped).toBe(`{${property}}`);
  });

  it('should replace a property in a string', async () => {
    const message = 'message {first}',
      replaced = wrapper.replaceProperty(message, 'first', 'replaced');
    await expect(replaced).toBe('message replaced');
  });

  it('should replace properties in a string', async () => {
    const message = 'messages {first} {second}',
      replaced = wrapper.replaceProperties(message, {
        first: 'both',
        second: 'replaced',
      });
    await expect(replaced).toBe('messages both replaced');
  });
});
