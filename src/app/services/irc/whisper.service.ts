import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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

  constructor(private http: HttpClient) {}

  setData(
    userId: string,
    botId: string,
    token: string,
    clientId: string
  ): void {
    this.userId = userId;
    this.botId = botId;
    this.token = token;
    this.clientId = clientId;
  }

  /**
   * Validates an OAuth token and retrieves the user data contained within.
   * @param token An OAuth token
   */
  async sendWhisper(message: string): Promise<void> {
    console.log(`Sending whisper: ${message}`);
    const options = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Client-Id': this.clientId,
      },
    };
    this.http
      .post(
        `${WhisperService.whisperUrl}?from_user_id=${this.userId}&to_user_id=${this.botId}`,
        { message: message },
        options
      )
      .toPromise();
  }
}
