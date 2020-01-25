import { IrcService } from '../irc/irc.service';
import * as config from './response-parser.json';
import { ParserRule, RuleResponse } from './parser-rule';

export class ResponseParser {
  private static messages = new Array<string>();
  private static rules = new Array<ParserRule>();


  public static async Process(ircService: IrcService, rule: ParserRule): Promise<Array<string>> {
    this.rules.push(rule);
    ircService.Send(rule.command);
    return new Promise(() => { this.awaitResponse(rule.responses); });
  }

  private static async awaitResponse(options: Array<RuleResponse>): Promise<Array<string>> {
    return null;
  }

  private static onWhisper(message: string): void {
    for (const rule of ResponseParser.rules) {
      const match = ResponseParser.matchResponse(message, rule);
      if (match) {

      }
    }
    ResponseParser.messages.push(message);
    if (ResponseParser.messages.length > config.bufferSize.max) {
      ResponseParser.messages.splice(0, ResponseParser.messages.length - config.bufferSize.min);
    }
  }

  private static matchResponse(message: string, rule: ParserRule): RuleResponse {
    for (const response of rule.responses) {
      const match = message.match(response.pattern);
      if (match) {
        return {
          id: response.id,
          pattern: response.pattern,
          output: match
        };
      }
    }
    return null;
  }
}
