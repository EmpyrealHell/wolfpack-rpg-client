export class CatchData {
  constructor(
    public fish: string,
    public user: string,
    public length: number,
    public weight: number,
    public points: number
  ) {}
}

export enum LineStatus {
  Idle,
  InWater,
  FishHooked,
}

export class Tournament {
  endTime: Date | undefined;
  participants = 0;
  rank = 0;
  userPoints = 0;
  winner: string | undefined;
  winnerPoints = 0;
}
