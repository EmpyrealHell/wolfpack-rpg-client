import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SendCallback } from './message-queue';

/**
 * A service that validates oauth tokens and unpacks the data they contain.
 */
@Injectable({
  providedIn: 'root',
})
export class WhisperService {
  private static whisperUrl = 'https://api.twitch.tv/helix/whispers';
  private userId = '';
  private botId = '';
  private token = '';
  private clientId = '';

  private restricted = false;
  private onError: SendCallback = (message: string) => {};

  constructor(private http: HttpClient) {}

  setData(
    userId: string,
    botId: string,
    token: string,
    clientId: string,
    onError: SendCallback
  ): void {
    this.userId = userId;
    this.botId = botId;
    this.token = token;
    this.clientId = clientId;
    this.onError = onError;
  }

  /**
   * Validates an OAuth token and retrieves the user data contained within.
   * @param token An OAuth token
   */
  async sendWhisper(message: string): Promise<void> {
    if (!this.restricted) {
      const response = await this.http
        .post<string>(
          `${WhisperService.whisperUrl}?from_user_id=${this.userId}&to_user_id=${this.botId}`,
          { message: message },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              'Client-Id': this.clientId,
            },
            observe: 'response',
          }
        )
        .toPromise();
      if (response.status === 401) {
        this.restricted = true;
        if (this.onError) {
          this.onError(
            'Unauthorized response attempting to send whisper. Please make sure your account has a verified phone number in your security and privacy settings on Twitch.'
          );
        }
      }
    }
  }
}
