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
  private responderArray = new Array<Responder>(
    new Responder(fishConfig.patterns.Leader, (data) => {
      for (const record of this.records) {
        if (record.Fish === data[1]) {
          record.Update(data[2], data[3]);
          return;
        }
      }
      this.records.push(new FishingRecord(data[1], data[2], data[3]));
    })
  );
  public get responders(): Array<Responder> {
    return this.responderArray;
  }
  public get loadCommands(): Array<string> {
    return fishConfig.loadCommands;
  }

  public records = new Array<FishingRecord>();
}

export class FishingRecord {
  public Size: number;
  constructor(public Fish: string, public Name: string, size: string) {
    this.Size = parseFloat(size);
  }

  public Update(name: string, size: string): void {
    this.Name = name;
    this.Size = parseFloat(size);
  }
}
