import { Component, Inject, Input, ViewChild } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialog } from 'src/app/components/error-dialog/error-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRipple } from '@angular/material/core';

/**
 * Widget used to display general information.
 */
@Component({
  selector: 'app-info-widget',
  templateUrl: './info.widget.html',
  standalone: false,
})
export class InfoWidgetComponent extends AbstractWidgetComponent {
  protected subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void {}
  protected sendInitialCommands(commandService: CommandService): void {}
  name = 'Info';
}
