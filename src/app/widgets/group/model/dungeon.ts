export class Dungeon {
  constructor(
    public id: number,
    public name: string
  ) {}
}

export class DungeonMode {
  constructor(
    public flag: string,
    public name: string
  ) {}
}

export class DungeonRun {
  constructor(
    public dungeon: number,
    public mode: string
  ) {}
}

export class PartyMember {
  public classId = 0;
  public level = 0;
  constructor(
    public name: string,
    public pending: boolean
  ) {}
}
