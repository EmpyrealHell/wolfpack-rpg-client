import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CharacterClass } from './model/character';

@Component({
  selector: 'select-class-dialog',
  templateUrl: './select.class.dialog.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
})
export class SelectClassDialog {  dialogRef = inject<MatDialogRef<SelectClassDialog>>(MatDialogRef);
  data = inject<SelectClassData>(MAT_DIALOG_DATA);

}

export interface SelectClassData {
  classes: CharacterClass[];
  isRespec: boolean;
  cost: number;
}
