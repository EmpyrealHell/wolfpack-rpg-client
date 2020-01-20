import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    public GetUserInfo(token: string): Observable<UserData> {
        if (UserService.cachedResponse) {
            return of(UserService.cachedResponse);
        }
        const options = {
            headers: {
                Authorization: `OAuth ${token}`
            }
        };
        return this.http.get<UserData>(UserService.tokenValidationUrl, options);
    }

    /**
     * Updates the chache of the user service to prevent unneccesary API calls
     * @param data A resolved UserData object.
     */
    public UpdateCache(data: UserData): void {
        UserService.cachedResponse = data;
    }
}
