import { PromiseResponse } from './promise-response';

export class Utils {
  /**
   * Determines if the source array contains all elements of the target array.
   * @param source An array check the contents of.
   * @param target An array containing values to check against the source.
   */
  public static HasAll(source: Array<string>, target: Array<string>): boolean {
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
  public static CreateMap(itemSep: string, kvSep: string, kvString: string): Map<string, string> {
    const keyValuePairs = kvString.split(itemSep);
    const map = new Map<string, string>();
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
  public static GenerateState(size: number): string {
    let state = '';
    for (let i = 0; i < size; i++) {
      const value = Math.round((Math.random() * 255));
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
  public static StringJoin(sep: string, values: Array<string>): string {
    let output = '';
    for (const value of values) {
      output += sep + value;
    }
    return output.substring(sep.length);
  }

  /**
   * Awaits a response and handles promise rejection and any errors thrown.
   * @param promise Any promise that can be rejected.
   */
  public static async PromiseWithReject<T>(promise: Promise<T>): Promise<PromiseResponse<T>> {
    const response: PromiseResponse<T> = new PromiseResponse<T>();
    try {
      response.Response = await promise;
      response.Success = true;
    } catch (error) {
      response.Error = error;
      response.Success = false;
    }
    return response;
  }
}
