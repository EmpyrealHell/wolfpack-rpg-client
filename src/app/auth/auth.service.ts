import { Injectable } from '@angular/core';
import { AuthData } from './auth.data';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private static authStateKey = 'authState';
    private data: AuthData = new AuthData();

    GetAuthData(): AuthData {
        return this.data;
    }

    SaveState(): void {
        localStorage.setItem(AuthService.authStateKey, this.data.State);
    }

    LoadState(): void {
        this.data.State = localStorage.getItem(AuthService.authStateKey);
    }
}
