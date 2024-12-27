import * as CommandData from './command-data.json';
import { CommandResponse, SubgroupExpression } from './command-response';

export class CommandLoader {
  private messages = new Map<string, Map<string, CommandResponse>>();

  get all(): string[] {
    return [...this.messages.keys()];
  }

  get(key: string): Map<string, CommandResponse> | undefined {
    return this.messages.get(key);
  }

  load(): void {
    this.registerResponses();
    this.registerMessages();
  }

  private registerContainer<T>(
    name: string,
    container: T,
    isCommand = false
  ): void {
    for (const groupKey in container) {
      if (container[groupKey]) {
        const group = container[groupKey];
        this.registerGroup(`${name}.${groupKey}`, group, isCommand);
      }
    }
  }

  private registerGroup<T>(name: string, group: T, isCommand: boolean): void {
    for (const entryKey in group) {
      if (group[entryKey]) {
        const entry = group[entryKey];
        if (isCommand) {
          this.registerCommand(`${name}.${entryKey}`, entry);
        } else {
          this.registerEntry(`${name}.${entryKey}`, entryKey, entry);
        }
      }
    }
  }

  private registerCommand<T>(name: string, command: T): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responses = (command as any)['responses'];
    for (const catKey in responses) {
      if (responses[catKey]) {
        const category = responses[catKey];
        for (const entryKey in category) {
          if (category[entryKey]) {
            const entry = category[entryKey];
            this.registerEntry(`${name}.${catKey}`, entryKey, entry);
          }
        }
      }
    }
  }

  private registerEntry<T>(name: string, id: string, entry: T): void {
    let map = this.messages.get(name);
    if (!map) {
      map = new Map<string, CommandResponse>();
      this.messages.set(name, map);
    }
    if (typeof entry === 'string') {
      map.set(id, new CommandResponse(entry));
    } else if (typeof entry === 'object') {
      const subgroupEntry = entry as unknown as SubgroupExpression;
      const response = new CommandResponse(
        subgroupEntry.response,
        subgroupEntry.subGroups
      );
      map.set(id, response);
    }
  }

  private registerResponses(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const commands = CommandData.commands as any;
    this.registerContainer('command', commands, true);
  }

  private registerMessages(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages = CommandData.messages as any;
    this.registerContainer('message', messages);
  }
}
