import { Component, Inject, Input, ViewChild } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialog } from 'src/app/components/error-dialog/error-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRipple } from '@angular/material/core';
import { Dungeon } from './model/dungeon';

/**
 * Widget used to display general information.
 */
@Component({
  selector: 'app-group-widget',
  templateUrl: './group.widget.html',
  standalone: false,
})
export class GroupWidgetComponent extends AbstractWidgetComponent {
  dungeons: Dungeon[] = [];
  party: string[] = [];

  protected subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void {}
  protected sendInitialCommands(commandService: CommandService): void {}
  name = 'Group';
}
