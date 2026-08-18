import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    // Tslint:disable-next-line:component-selector
    selector: 'error-dialog',
    templateUrl: './error-dialog.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
// Tslint:disable-next-line:component-class-suffix
export class ErrorDialog {  matDialogRef = inject<MatDialogRef<ErrorDialog>>(MatDialogRef);
  data = inject<ErrorDialogData>(MAT_DIALOG_DATA);

}

export interface ErrorDialogData {
  title: string;
  message: string;
}
