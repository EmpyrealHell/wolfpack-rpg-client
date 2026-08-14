import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Dungeon } from './model/dungeon';
import { noop } from 'rxjs';
import { MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatList } from '@angular/material/list';

/**
 * Widget used to display general information.
 */
@Component({
    selector: 'app-group-widget',
    templateUrl: './group.widget.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatCardContent,
        MatButton,
        MatList,
    ],
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
