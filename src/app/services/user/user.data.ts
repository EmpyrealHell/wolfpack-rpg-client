// tslint:disable: variable-name
/**
 * Response interface from the Twitch token validation service.
 */
export interface UserData {
  /**
   * Id of the client the OAuth token was created for.
   */
  client_id: string;
  /**
   * Username of the authenticated user.
   */
  login: string;
  /**
   * Numeric id of the authenticated user.
   */
  user_id: string;
  /**
   * Scopes the token provides access to.
   */
  scopes: string[];
}
