import { WidgetComponent } from 'src/app/components/widget-factory/widget.component';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { IrcService } from 'src/app/services/irc/irc.service';
import { Responder } from './responder';

export abstract class AbstractWidgetComponent implements WidgetComponent {
  public ircService: IrcService;
  public configManager: ConfigManager;
  public name: string;

  public abstract get loadCommands(): Array<string>;
  public abstract get responders(): Array<Responder>;

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
    this.ircService.register(`${this.name}-widget`, (message) => { this.onWhisper(message); }, true);
    const lines = this.ircService.getLines();
    const queue = this.ircService.getQueuedMessages();
    for (const line of lines) {
      this.onWhisper(line);
    }
    const commands = this.loadCommands;
    for (const command of commands) {
      if (lines.indexOf(`>> ${command}`) === -1
        && queue.indexOf(command) === -1) {
        this.ircService.send(command);
      }
    }
  }
}
