import { PromiseResponse } from './promise-response';

export class Utils {
  /**
   * Determines if the source array contains all elements of the target array.
   * @param source An array check the contents of.
   * @param target An array containing values to check against the source.
   */
  static hasAll(source: string[], target: string[]): boolean {
    if (!source || !target) {
      return false;
    }
    for (const value of target) {
      if (!source.includes(value)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Splits a string into key-value pairs and converts that into a map.
   * @param itemSep The character used to separate the pairs.
   * @param kvSep The character used to separate the key and value.
   * @param kvString A string with a list of key-value pairs.
   */
  static createMap(
    itemSep: string,
    kvSep: string,
    kvString: string
  ): Map<string, string> {
    const map = new Map<string, string>();
    if (
      !kvString ||
      kvString.length === 0 ||
      !itemSep ||
      itemSep.length === 0 ||
      !kvSep ||
      kvSep.length === 0 ||
      kvString.indexOf(kvSep) === -1
    ) {
      return map;
    }
    const keyValuePairs = kvString.split(itemSep);
    for (const pair of keyValuePairs) {
      const [key, value] = pair.split(kvSep);
      map.set(key, value);
    }
    return map;
  }

  /**
   * Generates a random string of hexadecimal bytes.
   * @param size The number of bytes of randomness to generate.
   */
  static generateState(size: number): string {
    let state = '';
    for (let i = 0; i < size; i++) {
      const value = Math.round(Math.random() * 255);
      state += value < 16 ? `0${value.toString(16)}` : value.toString(16);
    }
    return state;
  }

  /**
   * Joins together an array of strings, separated by an arbitrary string, into
   * a single string containing all values in the array.
   * @param sep The string to place between each value in the array.
   * @param values An array of strings to join together.
   */
  static stringJoin(sep: string, values: string[]): string {
    let output = '';
    if (!values || values.length === 0) {
      return output;
    }
    const delimiter = sep ? sep : '';
    for (const value of values) {
      output += delimiter + value;
    }
    return output.substring(delimiter.length);
  }

  /**
   * Awaits a response and handles promise rejection and any errors thrown.
   * @param promise Any promise that can be rejected.
   */
  static async promiseWithReject<T, E>(
    promise: Promise<T>
  ): Promise<PromiseResponse<T, E>> {
    const response: PromiseResponse<T, E> = {
      response: undefined,
      success: false,
      error: undefined,
    };
    try {
      response.response = await promise;
      response.success = true;
    } catch (error) {
      response.error = error;
      response.success = false;
    }
    return response;
  }

  /**
   * Matches a regular expression against a string until there are no more
   * matches. If the regexp object is not global, a global copy will be made.
   * @param regex A regular expression object.
   * @param str A string.
   */
  static execAll(regex: RegExp, str: string): RegExpExecArray[] {
    const matches: RegExpExecArray[] = [];
    let globalRegex = regex;
    if (regex.flags.indexOf('g') === -1) {
      globalRegex = new RegExp(regex.source, regex.flags + 'g');
    }
    for (
      let result = globalRegex.exec(str);
      result;
      result = globalRegex.exec(str)
    ) {
      matches.push(result);
    }
    return matches;
  }

  /**
   * Extracts the name captures from a regular expression result and converts
   * them into a map.
   * @param match A regular expression exec result.
   */
  static extractNameCaptures(match: RegExpExecArray): Map<string, string> {
    const map = new Map<string, string>();
    if (match.groups) {
      for (const key in match.groups) {
        if (match.groups[key]) {
          map.set(key, match.groups[key]);
        }
      }
    }
    return map;
  }

  /**
   * Gets the timezone offset for a specific timezone for a given date object.
   * @param date A date object.
   * @param timeZone The timezone to get the offset for.
   */
  static getTimeZoneOffset(date: Date, timeZone: string): number {
    let iso = date
      .toLocaleString('en-CA', { timeZone, hour12: false })
      .replace(', ', 'T');
    iso += '.' + date.getMilliseconds().toString().padStart(3, '0');
    const utc = new Date(iso + 'Z');
    return -(utc.getTime() - date.getTime()) / 60 / 1000;
  }

  private static timezoneDelta = -1;

  /**
   * Parses the date/time string that comes from the bot, which is in US format
   * in the central time zone (-6/-5).
   * @param date A string containing a datetime value
   */
  static parseDateFromBot(date: string | undefined): Date {
    if (date) {
      const dateString = date as string;
      if (Utils.timezoneDelta === -1) {
        const millisInMinute = 60 * 1000;
        const now = new Date(Date.now());
        const serverOffset =
          this.getTimeZoneOffset(now, 'America/Chicago') * millisInMinute;
        const localOffset = now.getTimezoneOffset() * millisInMinute;
        Utils.timezoneDelta = serverOffset - localOffset;
      }

      const parse = /([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4}) ([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})((?: PM)?)/;
      const values = dateString.match(parse);

      if (values) {
        const month = parseInt(values[1]);
        const day = parseInt(values[2]);
        const year = parseInt(values[3]);

        let hour = parseInt(values[4]);
        const minute = parseInt(values[5]);
        const second = parseInt(values[6]);

        if (values[7].length > 0) {
          hour += 12;
        }

        const normalized = new Date(
          year,
          month - 1,
          day,
          hour,
          minute,
          second,
          0
        );
        return new Date(normalized.getTime() + Utils.timezoneDelta);
      }
    }
    return new Date(Date.now());
  }
}
