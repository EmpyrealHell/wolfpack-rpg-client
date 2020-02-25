import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserData } from './user.data';

/**
 * A service that validates oauth tokens and unpacks the data they contain.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private static tokenValidationUrl = 'https://id.twitch.tv/oauth2/validate';
  private static cachedResponse: UserData;

  constructor(private http: HttpClient) { }

  /**
   * Validates an OAuth token and retrieves the user data contained within.
   * @param token An OAuth token
   */
  async getUserInfo(token: string): Promise<UserData> {
    if (UserService.cachedResponse) {
      return UserService.cachedResponse;
    }
    const options = {
      headers: {
        Authorization: `OAuth ${token}`
      }
    };
    return this.http.get<UserData>(UserService.tokenValidationUrl, options).toPromise<UserData>();
  }

  /**
   * Updates the chache of the user service to prevent unneccesary API calls
   * @param data A resolved UserData object.
   */
  updateCache(data: UserData): void {
    UserService.cachedResponse = data;
  }
}
