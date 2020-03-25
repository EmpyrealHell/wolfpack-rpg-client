import * as CommandData from './command-data.json';
import { Utils } from 'src/app/util/utils';

describe('CommandData', () => {
  // tslint:disable-next-line: no-any
  const getAllCommands = (obj: any): string[] => {
    const arr: string[] = [];
    for (const property in obj) {
      if (obj[property]) {
        if (property === 'command') {
          arr.push(obj[property]);
        } else if (typeof obj[property] === 'object') {
          arr.push(...getAllCommands(obj[property]));
        }
      }
    }
    return arr;
  };

  it('should wrap parameters in commands with curly braces', () => {
    const commands = getAllCommands(CommandData);
    const wrongCommands: string[] = [];
    for (const command of commands) {
      const parts = command.split(' ').splice(0, 1);
      for (const part of parts) {
        if (!part.startsWith('{') || !part.endsWith('}')) {
          wrongCommands.push(command);
        }
      }
    }
    const wrongList = Utils.stringJoin(', ', wrongCommands);
    expect(wrongList).toBe('');
  });
});
