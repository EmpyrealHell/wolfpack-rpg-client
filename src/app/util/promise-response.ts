/**
 * Holds responses from utility method for handling promise rejection in the
 * async/await pattern.
 */
export interface PromiseResponse<T, E> {
  /**
   * Whether the promise was resolved (true) or rejected (false).
   */
  success: boolean;
  /**
   * The response from the promise. This should match the same generic type as
   * the promise being resolved.
   */
  response?: T;
  /**
   * The error thrown if the promise is rejected.
   */
  error?: E;
}
