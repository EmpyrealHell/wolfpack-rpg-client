import { Component, Inject, Input, ViewChild } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Pet, Rarity, Stable } from './model/pet';
import { MatDialog } from '@angular/material/dialog';
import { RenamePetDialog } from './rename.pet.dialog';
import { ErrorDialog } from 'src/app/components/error-dialog/error-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRipple } from '@angular/material/core';

/**
 * Widget used to display pet data.
 * TODO:
 *  * add actions to selected display
 */
@Component({
  selector: 'app-pet-widget',
  templateUrl: './pet.widget.html',
  standalone: false,
})
export class PetWidgetComponent extends AbstractWidgetComponent {
  name = 'Pets';
  private static rarities = new Map<number, Rarity>([
    [1, new Rarity(1, 'common', '#ffffff')],
    [2, new Rarity(2, 'uncommon', '#6495ed')],
    [3, new Rarity(3, 'rare', '#9932cc')],
    [4, new Rarity(4, 'epic', '#ffa500')],
    [5, new Rarity(5, 'legendary', '#b22222')],
  ]);
  private static pets = new Map<number, Pet>();

  stable: Stable[] = [];
  selected: Stable | undefined;
  summoning: Stable | undefined;

  @ViewChild(MatRipple)
  ripple: MatRipple | undefined;

  constructor(
    public dialog: MatDialog,
    public snackbar: MatSnackBar
  ) {
    super();
  }

  private handleStable(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'compact') {
      for (const sub of subGroups) {
        const id = parseInt(sub.get('id') ?? '0');
        const petType = sub.get('type') ?? 'unknown';
        const description = sub.get('description') ?? '';
        const rarityId = parseInt(sub.get('rarity') ?? '0');
        const rarity =
          PetWidgetComponent.rarities.get(rarityId) ??
          new Rarity(rarityId, 'unknown', '#ffffff');
        let pet: Pet;
        if (!PetWidgetComponent.pets.has(id)) {
          pet = new Pet(id, petType, rarity, description);
          PetWidgetComponent.pets.set(id, pet);
        } else {
          pet =
            PetWidgetComponent.pets.get(id) ?? new Pet(id, petType, rarity, '');
        }
        const name = sub.get('name') ?? '';
        const sparkly = sub.get('sparkly') === 'S';
        const level = parseInt(sub.get('level') ?? '0');
        const xp = parseInt(sub.get('xp') ?? '0');
        const affection = parseInt(sub.get('affection') ?? '0');
        const hunger = parseInt(sub.get('hunger') ?? '0');
        const active = sub.get('active') === 'A';

        const index = this.stable.length + 1;

        this.stable.push(
          new Stable(
            index,
            pet,
            name,
            level,
            xp,
            affection,
            hunger,
            sparkly,
            active
          )
        );
      }
    }
  }

  private handleFeedSuccess(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'levelUp') {
      //TODO: Maybe play a sound here?
      const petName = groups.get('name') ?? '';
      const level = groups.get('level') ?? '';
      this.snackbar.open(
        `${petName} leveled up! They are now level ${level}.`,
        undefined,
        { duration: 5000 }
      );
      console.log(this.ripple);
      this.ripple?.launch({ centered: true });
      if (this.selected?.name === petName) {
        this.selected.level = parseInt(level);
      }
    } else if (id === 'confirmation') {
      const cost = parseInt(groups.get('cost') ?? '0');
      const name = groups.get('name') ?? '';
      this.snackbar.open(
        `You were charged ${cost} wolfcoins to feed ${name}. They feel refreshed!`,
        undefined,
        { duration: 5000 }
      );
    }
  }

  private handleFeedError(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'full') {
      const petName = groups.get('name') ?? '';
      this.snackbar.open(
        `${petName} is full and doesn't need to eat!.`,
        undefined,
        { duration: 5000 }
      );
    } else if (id === 'insufficientFunds') {
      const cost = parseInt(groups.get('cost') ?? '0');
      this.snackbar.open(
        `You lack the ${cost} wolfcoins needed to feed your pet.`,
        undefined,
        { duration: 5000 }
      );
    }
  }

  private handleGloatError(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'insufficientFunds') {
      this.snackbar.open("You don't have enough coins to gloat!", undefined, {
        duration: 5000,
      });
    }
  }

  private handleSummonSuccess(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'confirmation') {
      const summoned = groups.get('summoned') ?? '';
      if (summoned === this.summoning?.name) {
        this.summoning.active = true;
      }
      const dismissed = groups.get('dismissed') ?? '';
      const matches = this.stable.filter(x => x.name === dismissed && x.active);
      if (matches && matches.length > 0) {
        matches[0].active = false;
      }
    }
  }

  private handleDismissSuccess(
    name: string,
    id: string,
    groups: Map<string, string>,
    subGroups: Array<Map<string, string>>,
    date: number
  ): void {
    if (id === 'confirmation') {
      const dismissed = groups.get('name') ?? '';
      const matches = this.stable.filter(x => x.name === dismissed && x.active);
      if (matches && matches.length > 0) {
        matches[0].active = false;
      }
    }
  }

  protected subscribeToResponses(
    id: string,
    commandService: CommandService
  ): void {
    commandService.subscribeToCommand(
      'pets',
      'list',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) =>
        this.handleStable(name, id, groups, subGroups, date)
    );
    commandService.subscribeToCommand(
      'pets',
      'feed',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleFeedSuccess(name, id, groups, subGroups, date);
      }
    );
    commandService.subscribeToCommand(
      'pets',
      'feed',
      'responses',
      'error',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleFeedError(name, id, groups, subGroups, date);
      }
    );
    commandService.subscribeToCommand(
      'shop',
      'gloatPet',
      'responses',
      'error',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleGloatError(name, id, groups, subGroups, date);
      }
    );
    commandService.subscribeToCommand(
      'pets',
      'summon',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleSummonSuccess(name, id, groups, subGroups, date);
      }
    );
    commandService.subscribeToCommand(
      'pets',
      'dismiss',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleDismissSuccess(name, id, groups, subGroups, date);
      }
    );
  }

  protected sendInitialCommands(commandService: CommandService): void {
    commandService.sendInitialCommand('pets', 'list');
  }

  public feedPet(): void {
    this.commandService?.sendCommandWithArguments('pets', 'feed', {
      id: this.selected?.index,
    });
  }

  public summonPet(): void {
    this.summoning = this.selected;
    this.commandService?.sendCommandWithArguments('pets', 'summon', {
      id: this.selected?.index,
    });
  }

  public dismissPet(): void {
    this.commandService?.sendCommand('pets', 'dismiss');
  }

  public releasePet(): void {
    this.commandService?.sendCommandWithArguments(
      'pets',
      'release',
      this.selected?.index
    );
  }

  public renamePet(): void {
    const dialogRef = this.dialog.open(RenamePetDialog, {
      data: { name: this.name, pet: this.selected },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commandService?.sendCommandWithArguments('pets', 'rename', [
          this.selected?.index,
          result,
        ]);
      }
    });
  }

  public gloatPet(): void {
    this.commandService?.sendCommandWithArguments('shop', 'gloatPet', {
      index: this.selected?.index,
    });
  }

  public debug(): void {
    const map = new Map<string, string>();
    map.set('name', 'Test Name');
    map.set('level', '3');
    this.handleFeedSuccess(
      '',
      'levelUp',
      map,
      new Array<Map<string, string>>(),
      0
    );
  }
}
