import { Component, Inject } from '@angular/core';
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
import { Stable } from './model/pet';

@Component({
  selector: 'rename-pet-dialog',
  templateUrl: './rename.pet.dialog.html',
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
export class RenamePetDialog {
  constructor(
    public dialogRef: MatDialogRef<RenamePetDialog>,
    @Inject(MAT_DIALOG_DATA) public data: RenameData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}

export interface RenameData {
  pet: Stable;
  name: string;
}
