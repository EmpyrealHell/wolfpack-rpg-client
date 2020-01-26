/**
 * Holds responses from utility method for handling promise rejection in the
 * async/await pattern.
 */
export class PromiseResponse<T> {
  /**
   * Whether the promise was resolved (true) or rejected (false).
   */
  Success: boolean;
  /**
   * The response from the promise. This should match the same generic type as
   * the promise being resolved.
   */
  Response: T;
  /**
   * The error thrown if the promise is rejected.
   */
  Error: any;
}
