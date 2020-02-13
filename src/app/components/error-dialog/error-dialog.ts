import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'error-dialog',
  templateUrl: './error-dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class ErrorDialog {

  constructor(public matDialogRef: MatDialogRef<ErrorDialog>, @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData) { }
}

export interface ErrorDialogData {
  message: string;
}
