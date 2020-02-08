import { WidgetComponent } from 'src/app/components/widget-factory/widget.component';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { Responder } from './responder';

export abstract class AbstractWidgetComponent implements WidgetComponent {
  public ircService: IrcService;
  public configManager: ConfigManager;

  public abstract get loadCommands(): Array<string>;
  public abstract get responders(): Array<Responder>;
  protected abstract get name(): string;

  protected onWhisper(message: string): void {
    const responders = this.responders;
    for (const responder of responders) {
      if (responder.pattern) {
        const match = message.match(responder.pattern);
        if (match) {
          responder.callback.call(responder.callback, match);
          return;
        }
      } else {
        responder.callback.call(responder.callback, null);
      }
    }
  }

  public onActivate(): void {
    this.ircService.Register(`${this.name}-widget`, (message) => { this.onWhisper(message); }, true);
    const history = this.ircService.GetHistory();
    const queue = this.ircService.GetQueuedMessages();
    const lines = history.split('\n');
    for (const line of lines) {
      this.onWhisper(line);
    }
    const commands = this.loadCommands;
    for (const command of commands) {
      if (history.indexOf(`>> ${command}`) === -1
        && queue.indexOf(command) === -1) {
        this.ircService.Send(command);
      }
    }
  }
}
