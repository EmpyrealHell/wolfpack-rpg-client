import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserData } from './user.data';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private static tokenValidationUrl = 'https://id.twitch.tv/oauth2/validate';

    constructor(private http: HttpClient) { }

    GetUserInfo(token: string): Observable<UserData> {
        const options = {
            headers: {
                Authorization: `OAuth ${token}`
            }
        };
        return this.http.get<UserData>(UserService.tokenValidationUrl, options);
    }
}
