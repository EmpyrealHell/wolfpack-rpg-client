import { Component, OnInit, Input } from '@angular/core';
import { IrcService } from 'src/app/services/irc/irc.service';
import { ConfigManager } from 'src/app/services/data/config-manager';
import { WidgetComponent } from 'src/app/components/widget-factory/widget.component';

@Component({
  selector: 'app-character-widget',
  templateUrl: './character.widget.html',
})
export class CharacterWidgetComponent implements WidgetComponent, OnInit {
  private level = 18;
  private class = 'Cleric';
  private experienceInLevel = 45;
  private experienceForNext = 100;
  private progress = this.experienceInLevel / this.experienceForNext * 100;

  private armor = {
    name: 'rags',
    rarity: 0
  };

  private weapon = {
    name: 'aluminum rod',
    rarity: 1
  };


  @Input() public ircService: IrcService;
  @Input() public configManager: ConfigManager;

  constructor() { }

  private onWhisper(message: string): void { }

  private levelProgress(): string {
    return (this.experienceInLevel / this.experienceForNext * 100).toFixed(2);
  }

  private colorByRarity(rarity: number): string {
    const rarities = ['#808080', '#aaaaaa'];
    return rarities[rarity];
  }

  public ngOnInit(): void {
    this.ircService.Register('character-widget', (message) => { this.onWhisper(message); }, true);
  }
}
