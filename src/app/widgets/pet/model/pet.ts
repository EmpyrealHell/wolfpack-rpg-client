export class Pet {
  constructor(
    public id: number,
    public name: string,
    public rarity: Rarity,
    public description: string
  ) {}
}

export class Stable {
  constructor(
    public pet: Pet,
    public name: string,
    public level: number,
    public xp: number,
    public affection: number,
    public hunger: number,
    public sparkly: boolean,
    public active: boolean
  ) {}
}

export class Rarity {
  constructor(
    public id: number,
    public name: string,
    public color: string
  ) {}
}
