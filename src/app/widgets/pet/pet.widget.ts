import { Component, Inject, Input, ViewChild } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Pet, Rarity, Stable } from './model/pet';
import { MatDialog } from '@angular/material/dialog';
import { ReleasePetDialog } from './release.pet.dialog';
import { ErrorDialog } from 'src/app/components/error-dialog/error-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRipple } from '@angular/material/core';

/**
 * Widget used to display pet data.
 * TODO: Add level up sounds
 */
@Component({
  selector: 'app-pet-widget',
  templateUrl: './pet.widget.html',
  standalone: false,
})
export class PetWidgetComponent extends AbstractWidgetComponent {
  name = 'Pets';
  private static pets = new Map<number, Pet>();

  stable: Stable[] = [];
  selected: Stable | undefined;
  summoning: Stable | undefined;
  lastFed: Stable | undefined;
  renaming = false;
  newName = '';

  @ViewChild(MatRipple)
  ripple: MatRipple | undefined;

  constructor(
    public dialog: MatDialog,
    public snackbar: MatSnackBar
  ) {
    super();
  }

  private getPetByName(name: string): Stable | undefined {
    const matches = this.stable.filter(x => x.name === name);
    if (matches && matches.length > 0) {
      return matches[0];
    }
    return undefined;
  }

  private getPetByAll(
    name: string,
    pet: string,
    sparkly: boolean
  ): Stable | undefined {
    const matches = this.stable.filter(
      x => x.name === name && x.pet.name === pet && x.sparkly === sparkly
    );
    if (matches && matches.length > 0) {
      return matches[0];
    }
    return undefined;
  }

  private handleStable(
    id: string,
    subGroups: Array<Map<string, string>>
  ): void {
    if (id === 'compact') {
      for (const sub of subGroups) {
        const id = parseInt(sub.get('id') ?? '0');
        const petType = sub.get('type') ?? 'unknown';
        const description = sub.get('description') ?? '';
        const rarityId = parseInt(sub.get('rarity') ?? '0');
        const rarity =
          this.clientDataService?.petRarities.get(rarityId) ??
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
    isReplay: boolean | undefined
  ): void {
    console.log(`Feed Success: ${name}, ${id}`);
    if (id === 'levelUp') {
      const level = groups.get('level') ?? '';
      if (this.lastFed) {
        if (!isReplay) {
          if (this.configManager?.getConfig().settings.playSounds) {
            const audio = new Audio(
              `./assets/pet-${this.lastFed.pet.id}-call.mp3`
            );
            audio.load();
            audio.play();
          }
          this.snackbar.open(
            `${this.lastFed.name} leveled up! They are now level ${level}.`,
            undefined,
            { duration: 5000 }
          );
          this.ripple?.launch({ centered: true });
        }
        this.lastFed.level = parseInt(level);
      }
    } else if (id === 'confirmation') {
      const cost = parseInt(groups.get('cost') ?? '0');
      const petName = groups.get('name') ?? '';
      const sparkly = groups.get('sparkly') ? true : false;
      const type = groups.get('pet') ?? '';
      const pet = this.getPetByAll(petName, type, sparkly);
      if (pet) {
        this.lastFed = pet;
        pet.hunger = 100;
      }
      if (!isReplay) {
        this.snackbar.open(
          `You were charged ${cost} wolfcoins to feed ${petName}. They feel refreshed!`,
          undefined,
          { duration: 5000 }
        );
      }
    }
  }

  private handleFeedError(id: string, groups: Map<string, string>): void {
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

  private handleGloatError(id: string): void {
    if (id === 'insufficientFunds') {
      this.snackbar.open("You don't have enough coins to gloat!", undefined, {
        duration: 5000,
      });
    }
  }

  private handleRenameSuccess(id: string, groups: Map<string, string>): void {
    if (id === 'confirmation') {
      const oldName = groups.get('oldName') ?? '';
      const type = groups.get('pet') ?? '';
      const sparkly = groups.get('sparkly') ? true : false;
      const newName = groups.get('name') ?? '';
      const pet = this.getPetByAll(oldName, type, sparkly);
      if (pet) {
        pet.name = newName;
      }
      this.renaming = false;
      this.newName = '';
    }
  }

  private handleSummonSuccess(id: string, groups: Map<string, string>): void {
    if (id === 'confirmation') {
      const summoned = groups.get('summoned') ?? '';
      const summonSparkly = groups.get('summonSparkly') ? true : false;
      const summonType = groups.get('summonPet') ?? '';
      const toSummon = this.getPetByAll(summoned, summonType, summonSparkly);
      if (toSummon) {
        toSummon.active = true;
      }
      const dismissed = groups.get('dismissed') ?? '';
      const dismissSparkly = groups.get('dismissSparkly') ? true : false;
      const dismissType = groups.get('dismissPet') ?? '';
      const toDismiss = this.getPetByAll(
        dismissed,
        dismissType,
        dismissSparkly
      );
      if (toDismiss) {
        toDismiss.active = false;
      }
    }
  }

  private handleDismissSuccess(id: string, groups: Map<string, string>): void {
    if (id === 'confirmation') {
      const dismissed = groups.get('name') ?? '';
      const sparkly = groups.get('sparkly') ? true : false;
      const type = groups.get('pet') ?? '';
      const toDismiss = this.getPetByAll(dismissed, type, sparkly);
      if (toDismiss) {
        toDismiss.active = false;
      }
    }
  }

  private handlePendingRelease(id: string): void {
    if (id === 'confirmation') {
      if (this.selected) {
        const dialogRef = this.dialog.open(ReleasePetDialog, {
          data: this.selected,
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.commandService?.sendCommand('pets', 'releaseConfirm');
          } else {
            this.commandService?.sendCommand('pets', 'releaseCancel');
          }
        });
      }
    }
  }

  private handleReleaseSuccess(id: string, groups: Map<string, string>): void {
    if (id === 'confirmation') {
      const petName = groups.get('name') ?? '';
      const pet = this.getPetByName(petName);
      if (pet) {
        this.snackbar.open(`Goodbye ${petName}!`, undefined, {
          duration: 5000,
        });
        const index = this.stable.indexOf(pet);
        if (index >= 0) {
          this.stable.splice(index, 1);
        }
      }
    }
  }

  private handleHungerWarning(
    groups: Map<string, string>,
    isCritical: boolean
  ): void {
    const petName = groups.get('name') ?? '';
    const sparkly = groups.get('sparkly') ? true : false;
    const type = groups.get('pet') ?? '';
    const pet = this.getPetByAll(petName, type, sparkly);
    if (pet) {
      pet.hunger = isCritical ? 10 : 25;
      const hunger = isCritical ? 'starving' : 'hungry';
      this.snackbar.open(
        `${petName} is ${hunger}, and needs to be fed!`,
        undefined,
        {
          duration: 5000,
        }
      );
    }
  }

  private handleHungerDeath(
    groups: Map<string, string>,
    isReplay: boolean
  ): void {
    const petName = groups.get('name') ?? '';
    const sparkly = groups.get('sparkly') ? true : false;
    const type = groups.get('pet') ?? '';
    const pet = this.getPetByAll(petName, type, sparkly);
    if (pet) {
      if (!isReplay) {
        this.dialog.open(ErrorDialog, {
          data: {
            title: 'Your pet has died!',
            message: `${petName} starved to death.`,
          },
        });
      }
      const index = this.stable.indexOf(pet);
      if (index >= 0) {
        this.stable.splice(index, 1);
      }
    }
  }

  private handlePetFound(): void {
    this.commandService?.sendCommand('pets', 'list');
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
      (name, id, groups, subGroups, date) => this.handleStable(id, subGroups)
    );
    commandService.subscribeToCommand(
      'pets',
      'feed',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date, isReplay) => {
        this.handleFeedSuccess(name, id, groups, isReplay);
      }
    );
    commandService.subscribeToCommand(
      'pets',
      'feed',
      'responses',
      'error',
      id,
      (name, id, groups, subGroups, date, isReplay) => {
        if (!isReplay) {
          this.handleFeedError(id, groups);
        }
      }
    );
    commandService.subscribeToCommand(
      'shop',
      'gloatPet',
      'responses',
      'error',
      id,
      (name, id, groups, subGroups, date, isReplay) => {
        if (!isReplay) {
          this.handleGloatError(id);
        }
      }
    );
    commandService.subscribeToCommand(
      'pets',
      'rename',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleRenameSuccess(id, groups);
      }
    );
    commandService.subscribeToCommand(
      'pets',
      'summon',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleSummonSuccess(id, groups);
      }
    );
    commandService.subscribeToCommand(
      'pets',
      'dismiss',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleDismissSuccess(id, groups);
      }
    );
    commandService.subscribeToCommand(
      'pets',
      'release',
      'responses',
      'pending',
      id,
      (name, id, groups, subGroups, date, isReplay) => {
        if (!isReplay) {
          this.handlePendingRelease(id);
        }
      }
    );
    commandService.subscribeToCommand(
      'pets',
      'release',
      'responses',
      'success',
      id,
      (name, id, groups, subGroups, date) => {
        this.handleReleaseSuccess(id, groups);
      }
    );
    commandService.subscribeToMessage(
      'pets',
      'hungerWarning',
      id,
      (name, id, groups, subGroups, date, isReplay) => {
        if (!isReplay) {
          this.handleHungerWarning(groups, false);
        }
      }
    );
    commandService.subscribeToMessage(
      'pets',
      'hungerCritical',
      id,
      (name, id, groups, subGroups, date, isReplay) => {
        if (!isReplay) {
          this.handleHungerWarning(groups, true);
        }
      }
    );
    commandService.subscribeToMessage(
      'pets',
      'hungerDeath',
      id,
      (name, id, groups, subGroups, date, isReplay) => {
        this.handleHungerDeath(groups, isReplay ?? false);
      }
    );
    commandService.subscribeToMessage(
      'pets',
      'dungeonFound',
      id,
      (name, id, groups, subGroups, date, isReplay) => {
        if (!isReplay) {
          this.handlePetFound();
        }
      }
    );
    // Need to subscribe to the pet announcements from dungeon runs (new pet, pet hungry, pet starving, pet died)
  }

  protected sendInitialCommands(commandService: CommandService): void {
    commandService.sendInitialCommand('pets', 'list');
  }

  public setSelected(pet: Stable): void {
    this.selected = pet;
    this.renaming = false;
    this.newName = '';
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
    this.commandService?.sendCommandWithArguments('pets', 'release', {
      id: this.selected?.index,
    });
  }

  public renamePet(): void {
    this.renaming = true;
  }

  public gloatPet(): void {
    this.commandService?.sendCommandWithArguments('shop', 'gloatPet', {
      index: this.selected?.index,
    });
  }

  public cancelRename(): void {
    this.renaming = false;
    this.newName = '';
  }

  public confirmRename(): void {
    if (this.isValidName()) {
      this.commandService?.sendCommandWithArguments('pets', 'rename', {
        id: this.selected?.index,
        name: this.newName.replace('"', '\\"'),
      });
    }
  }

  public onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.confirmRename();
    } else if (event.key === 'Escape') {
      this.cancelRename();
    }
  }

  public onRenameClick(event: MouseEvent): void {
    this.confirmRename();
  }

  public onCancelClick(event: MouseEvent): void {
    this.cancelRename();
  }

  public isValidName(): boolean {
    return this.newName.length > 1 && this.newName.length < 17;
  }
}
