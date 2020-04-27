/**
 * Interface that describes the properties of a subgroup in the command data
 * json.
 */
export interface SubgroupExpression {
  response: string;
  subGroups: string;
}

/**
 * A regular expression with named capture groups extracted. This allows for
 * use of named capture groups in browsers that don't support them.
 */
export class RegExpNamed {
  /**
   * The pattern of the regular expression.
   */
  pattern: RegExp;
  /**
   * The names of the capture groups, in the order they appear. Groups without
   * names are named based on their index.
   */
  names: string[];

  constructor(patternString: string, flags?: string) {
    let pattern = patternString;
    this.names = [];
    let index = pattern.indexOf('(');
    while (index >= 0 && index + 2 < pattern.length) {
      if (index === 0 || pattern[index - 1] !== '\\') {
        if (pattern[index + 1] === '?') {
          if (pattern[index + 2] === '<') {
            const nameEnd = pattern.indexOf('>', index);
            this.names.push(pattern.substring(index + 3, nameEnd));
            pattern =
              pattern.substring(0, index + 1) + pattern.substring(nameEnd + 1);
          }
        } else {
          this.names.push(`group${this.names.length}`);
        }
      }
      index = pattern.indexOf('(', index + 1);
    }
    this.pattern = new RegExp(pattern, flags);
  }
}

/**
 * An object that holds a regex with optional subgroups.
 */
export class CommandResponse {
  /**
   * The regular expression that matches the whole message.
   */
  response: RegExpNamed;
  /**
   * Optional subgroup regular expression that is run globally to get extra
   * details.
   */
  subGroups: RegExpNamed | undefined;

  constructor(response: string, subGroups: string | undefined = undefined) {
    this.response = new RegExpNamed(`^${response}$`);
    if (subGroups) {
      this.subGroups = new RegExpNamed(subGroups, 'g');
    }
  }
}

/**
 * A class used to store matched responses for historical lookup.
 */
export class MatchedResponse {
  /**
   *
   * @param id The id of the response matched.
   * @param line The index of the line in the message history.
   * @param params The matched groups on this line
   * @param subParams An array of all of the sub parameters that were matched on the line.
   */
  constructor(
    public id: string,
    public line: number,
    public params: Map<string, string>,
    public subParams: Array<Map<string, string>>
  ) {}
}

/**
 * Stores all of the responses for a key.
 */
export class ResponseHistory {
  /**
   * An array of all responses that were matched.
   */
  responses: MatchedResponse[];
  /**
   * The last line that was scanned.
   */
  lastLine = 0;

  constructor() {
    this.responses = [];
  }
}
