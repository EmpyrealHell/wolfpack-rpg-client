import { Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CharacterClass } from './model/character';

@Component({
  selector: 'select-class-dialog',
  templateUrl: './select.class.dialog.html',
  standalone: true,
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
export class SelectClassDialog {
  constructor(
    public dialogRef: MatDialogRef<SelectClassDialog>,
    @Inject(MAT_DIALOG_DATA) public data: SelectClassData
  ) {}
}

export interface SelectClassData {
  classes: CharacterClass[];
  isRespec: boolean;
  cost: number;
}
