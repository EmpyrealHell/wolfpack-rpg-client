import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AuthComponent } from './auth/auth.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GameComponent } from './game/game.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { LayoutModule } from '@angular/cdk/layout';
import { ScrollingModule } from '@angular/cdk/scrolling';

import {
  MatButtonModule, MatCardModule, MatDividerModule, MatIconModule, MatInputModule,
  MatListModule, MatMenuModule, MatSidenavModule, MatSlideToggleModule, MatToolbarModule
} from '@angular/material';
import { ConsoleWidgetComponent } from './game/widgets/console/console.widget';
import { ShowLastDirective } from './directives/show-last.directive';


@NgModule({
  declarations: [
    ShowLastDirective,

    AppComponent,
    AuthComponent,
    GameComponent,

    ConsoleWidgetComponent
  ],
  imports: [
    AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, ReactiveFormsModule,
    HttpClientModule,

    FlexLayoutModule, LayoutModule, ScrollingModule,

    MatButtonModule, MatCardModule, MatDividerModule, MatIconModule, MatInputModule,
    MatListModule, MatMenuModule, MatSidenavModule, MatSlideToggleModule, MatToolbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
