import { CommandWrapper } from './command-wrapper';
import * as CommandData from './command-data.json';
import { Utils } from 'src/app/util/utils';

export class ConcreteCommandWrapper extends CommandWrapper {}

describe('CommandWrapper', () => {
  const wrapper = new ConcreteCommandWrapper();

  it('should get command strings', () => {
    const commandString = wrapper.getCommandString(
      'Chat',
      'Message',
      'Command'
    );
    expect(commandString).toBe(CommandData.Commands.Chat.Message.Command);
  });

  it('should wrap properties to match json', () => {
    const property = 'message';
    const wrapped = wrapper.key(property);
    expect(wrapped).toBe(`{${property}}`);
  });

  it('should replace a property in a string', () => {
    const message = 'message {first}';
    const replaced = wrapper.replaceProperty(message, 'first', 'replaced');
    expect(replaced).toBe('message replaced');
  });

  it('should replace properties in a string', () => {
    const message = 'messages {first} {second}';
    const replaced = wrapper.replaceProperties(message, {
      first: 'both',
      second: 'replaced',
    });
    expect(replaced).toBe('messages both replaced');
  });
});
