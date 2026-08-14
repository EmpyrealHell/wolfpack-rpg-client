import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { noop } from 'rxjs';

/**
 * Widget used to display general information.
 */
@Component({
  selector: 'app-info-widget',
  templateUrl: './info.widget.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class InfoWidgetComponent extends AbstractWidgetComponent {
  protected subscribeToResponses(
    _id: string,
    _commandService: CommandService
  ): void {
    noop();
  }
  protected sendInitialCommands(_commandService: CommandService): void {
    noop();
  }
  name = 'Info';
}
