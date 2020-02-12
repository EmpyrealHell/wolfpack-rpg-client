/**
 * Definition for callback function used in response listeners.
 */
export type ResponderCallback = (matches: Array<string>) => void;

/**
 * Provides functionality to listen for whispers that match a pattern and
 * execute a callback function when it finds a match.
 */
export class Responder {
  public pattern: RegExp;
  constructor(pattern: string, public callback: ResponderCallback) {
    this.pattern = new RegExp(`^${pattern}$`, 'mi');
  }
}
