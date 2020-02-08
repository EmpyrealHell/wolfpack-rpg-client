import { Component } from '@angular/core';
import { AbstractWidgetComponent } from '../abstract/abstract-widget';
import { Responder } from '../abstract/responder';



/**
 * Widget used to display character data.
 */
@Component({
  selector: 'app-fishing-widget',
  templateUrl: './fishing.widget.html',
})
export class FishingWidgetComponent extends AbstractWidgetComponent {
  public get loadCommands(): Array<string> {
    return [];
  }
  public get responders(): Array<Responder> {
    return [];
  }
  protected get name(): string {
    return 'fishing';
  }
}
