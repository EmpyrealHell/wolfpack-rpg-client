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
}
