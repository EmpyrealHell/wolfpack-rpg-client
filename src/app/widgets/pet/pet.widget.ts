import { Component, Input } from '@angular/core';
import { CommandService } from 'src/app/services/command/command-service';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Pet, Rarity, Stable } from './model/pet';

/**
 * Widget used to display pet data.
 * TODO:
 *  * Center stable display
 *  * add styles for summoned and sparkly
 *  * add selection on click
 *  * add selected display
 *  * add actions to selected display
 */
@Component({
  selector: 'app-pet-widget',
  templateUrl: './pet.widget.html',
  standalone: false,
})
export class PetWidgetComponent extends AbstractWidgetComponent {
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

  constructor() {
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

        this.stable.push(
          new Stable(pet, name, level, xp, affection, hunger, sparkly, active)
        );
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
  }

  protected sendInitialCommands(commandService: CommandService): void {
    commandService.sendInitialCommand('pets', 'list');
  }
}
