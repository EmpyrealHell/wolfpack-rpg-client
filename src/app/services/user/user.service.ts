import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from './auth.data';
import { UserData } from './user.data';

/**
 * A service that validates oauth tokens and unpacks the data they contain.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private static tokenValidationUrl = 'https://id.twitch.tv/oauth2/validate';
  private static getUserUrl = 'https://api.twitch.tv/helix/users';
  private static cachedResponse: AuthData | null;

  constructor(private http: HttpClient) {}

  /**
   * Validates an OAuth token and retrieves the user data contained within.
   * @param token An OAuth token.
   */
  async getUserAuth(token: string): Promise<AuthData> {
    if (UserService.cachedResponse) {
      return UserService.cachedResponse;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.http
      .get<AuthData>(UserService.tokenValidationUrl, options)
      .toPromise<AuthData>();
  }

  /**
   * Gets the details for a twitch user.
   * @param token An OAuth token.
   * @param username The username to get details for.
   */
  async getUserId(
    token: string,
    clientId: string,
    username: string
  ): Promise<UserData> {
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Client-Id': clientId,
      },
    };
    return this.http
      .get<UserData>(`${UserService.getUserUrl}?login=${username}`, options)
      .toPromise<UserData>();
  }

  /**
   * Updates the chache of the user service to prevent unneccesary API calls
   * @param data A resolved UserData object.
   */
  updateCache(data: AuthData | null): void {
    UserService.cachedResponse = data;
  }
}
