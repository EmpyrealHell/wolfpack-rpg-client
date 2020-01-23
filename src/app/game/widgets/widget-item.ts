import { WidgetComponent } from './widget.component';
import { Type } from '@angular/core';
import { IrcService } from 'src/app/irc/irc.service';
import { ConfigManager } from 'src/app/data/config-manager';

export class WidgetItem {
  constructor(public component: Type<WidgetComponent>, public name: string) { }
}
