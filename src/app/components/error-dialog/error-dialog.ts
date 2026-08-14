import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  // Tslint:disable-next-line:component-selector
  selector: 'error-dialog',
  templateUrl: './error-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
// Tslint:disable-next-line:component-class-suffix
export class ErrorDialog {  matDialogRef = inject<MatDialogRef<ErrorDialog>>(MatDialogRef);
  data = inject<ErrorDialogData>(MAT_DIALOG_DATA);

}

export interface ErrorDialogData {
  title: string;
  message: string;
}
