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
 * Interface that describes the properties of a subgroup in the command data
 * json.
 */
export interface SubgroupExpression {
  response: string;
  subGroups: string;
}
