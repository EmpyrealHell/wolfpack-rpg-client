import * as CommandData from './command-data.json';

/**
 * Wraps the command data json file with methods that allow type-safety when
 * accessing commands described in the json file. This will also cause
 * compile-time errors if there is a mismatch between the executing code and
 * the json file.
 */
export abstract class CommandWrapper {
  /**
   * Gets a string for a command from the config json.
   * @param group The name of the command group.
   * @param command The name of the command within the group.
   * @param message Must be 'Command' to ensure type safety.
   */
  getCommandString<
    G extends keyof typeof CommandData.commands,
    C extends keyof typeof CommandData.commands[G],
    M extends keyof typeof CommandData.commands[G][C]
  >(group: G, command: C, message: M): string {
    const groupObj = CommandData.commands[group];
    const commandObj = groupObj[command];
    const toSend = commandObj[message];
    return '' + toSend;
  }

  /**
   * Wraps a parameter in curly braces.
   * @param parameter The name of the parameter to wrap.
   */
  key(parameter: string): string {
    return `{${parameter}}`;
  }

  /**
   * Returns a modified command string with a single parameter replaced.
   * @param command The command string to modify.
   * @param key The parameter key to replace.
   * @param value The value to replace with.
   */
  replaceProperty(command: string, key: string, value: string): string {
    return command.replace(this.key(key), value);
  }

  /**
   * Returns a modified command string. The keys in the params object will be
   * replaced by their value in that object.
   * @param command The command string to modify.
   * @param params An object whose properties are used as parameter replacements.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replaceProperties(command: string, params: any): string {
    let output = command;
    for (const p in params) {
      if (params[p]) {
        output = output.replace(this.key(p), params[p]);
      }
    }
    return output;
  }
}
