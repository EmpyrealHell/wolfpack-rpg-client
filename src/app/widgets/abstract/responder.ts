/**
 * Definition for callback function used in response listeners.
 */
export type ResponderCallback = (matches: string[]) => void;

/**
 * Provides functionality to listen for whispers that match a pattern and
 * execute a callback function when it finds a match.
 */
export class Responder {
  pattern: RegExp;
  constructor(
    pattern: string | null,
    public callback: ResponderCallback
  ) {
    this.pattern = new RegExp(`^${pattern}$`, 'mi');
  }
}
