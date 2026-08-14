import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  ViewChild,
} from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Dungeon } from './model/dungeon';
import { noop } from 'rxjs';

/**
 * Widget used to display general information.
 */
@Component({
  selector: 'app-group-widget',
  templateUrl: './group.widget.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GroupWidgetComponent extends AbstractWidgetComponent {
  dungeons: Dungeon[] = [];
  party: string[] = [];

  protected subscribeToResponses(
    _id: string,
    _commandService: CommandService
  ): void {
    noop();
  }
  protected sendInitialCommands(_commandService: CommandService): void {
    noop();
  }
  name = 'Group';
}
