import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  // Tslint:disable-next-line:component-selector
  selector: 'error-dialog',
  templateUrl: './error-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
// Tslint:disable-next-line:component-class-suffix
export class ErrorDialog {
  constructor(
    public matDialogRef: MatDialogRef<ErrorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData
  ) {}
}

export interface ErrorDialogData {
  title: string;
  message: string;
}
