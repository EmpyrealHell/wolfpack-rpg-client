import { Component } from '@angular/core';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Responder } from '../abstract/responder';
import * as fishConfig from './fishing.widget.json';

/**
 * Widget used to display character data.
 */
@Component({
  selector: 'app-fishing-widget',
  templateUrl: './fishing.widget.html',
})
export class FishingWidgetComponent extends AbstractWidgetComponent {
  private responderArray: Responder[] = [
    new Responder(fishConfig.patterns.Leader, data => {
      for (const record of this.records) {
        if (record.fish === data[1]) {
          record.update(data[2], data[3]);
          return;
        }
      }
      this.records.push(new FishingRecord(data[1], data[2], data[3]));
    }),
  ];
  get responders(): Responder[] {
    return this.responderArray;
  }
  get loadCommands(): string[] {
    return fishConfig.loadCommands;
  }

  records = new Array<FishingRecord>();
}

export class FishingRecord {
  size: number;

  constructor(public fish: string, public name: string, size: string) {
    this.size = Number(size);
  }

  update(name: string, size: string): void {
    this.name = name;
    this.size = Number(size);
  }
}
