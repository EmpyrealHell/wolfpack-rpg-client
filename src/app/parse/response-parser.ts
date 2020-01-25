import { IrcService } from '../services/irc/irc.service';
import { ParserResult, ParserRule } from './parser-rule';
import * as parserConfig from './response-parsers.json';

/**
 * Promise resolve method.
 */
export type Resolve<T> = (value?: T | PromiseLike<T>) => void;
/**
 * Promise reject method.
 */
export type Reject = (reason?: any) => void;

/**
 * Parser that handles sending rules to an IRC client and listening to the
 * responses to create a result object.
 */
export class ResponseParser {
  private id: string;
  private rule: ParserRule;
  private match: ParserResult;
  private startTime: number;

  constructor(id: string, private ircService: IrcService) {
    this.id = `${id}-ResponseParser`;
    ircService.Register(this.id, (message) => { this.onWhisper(message); });
  }

  /**
   * Sends the rule command to the registered IRC client and moniters the
   * incoming messages to determine if any fulfill the response criteria of the
   * rule.
   * @param rule A parser rule to process.
   */
  public async Process(rule: ParserRule): Promise<ParserResult> {
    this.rule = rule;
    this.match = undefined;
    this.startTime = Date.now();
    this.ircService.Send(rule.command);
    return new Promise<ParserResult>((resolve, reject) => { this.awaitResponse(resolve, reject); });
  }

  private awaitResponse(resolve: Resolve<ParserResult>, reject: Reject): void {
    if (this.match) {
      this.ircService.Unregister(this.id);
      resolve(this.match);
    } else {
      const elapsed = Date.now() - this.startTime;
      if (elapsed >= parserConfig.Timeout * 1000) {
        reject(`No response received after ${parserConfig.Timeout} seconds.`);
      } else {
        setTimeout(() => {
          this.awaitResponse(resolve, reject);
        }, parserConfig.PollRate);
      }
    }
  }

  private onWhisper(message: string): void {
    if (this.rule) {
      for (const response of this.rule.responses) {
        const match = message.match(response.pattern);
        if (match) {
          this.match = new ParserResult(response.id, match);
          this.match.values = match;
        }
      }
    }
  }
}
