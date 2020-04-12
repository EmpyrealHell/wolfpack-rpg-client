/**
 * Interface that describes the properties of a subgroup in the command data
 * json.
 */
export interface SubgroupExpression {
  response: string;
  subGroups: string;
}

/**
 * An object that holds a regex with optional subgroups.
 */
export class CommandResponse {
  /**
   * The regular expression that matches the whole message.
   */
  response: RegExp;
  /**
   * Optional subgroup regular expression that is run globally to get extra
   * details.
   */
  subGroups: RegExp | undefined;

  constructor(response: string, subGroups: string | undefined = undefined) {
    this.response = new RegExp(`^${response}$`);
    if (subGroups) {
      this.subGroups = new RegExp(subGroups, 'g');
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
   * @param An array of all of the parameters that were matched on the line.
   */
  constructor(
    public id: string,
    public line: number,
    public params: Array<Map<string, string>>
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
