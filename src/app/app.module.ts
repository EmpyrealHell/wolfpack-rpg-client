import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AuthComponent } from './components/auth/auth.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GameComponent } from './components/game/game.component';
import { ConsoleWidgetComponent } from './widgets/console/console.widget';
import { CharacterWidgetComponent } from './widgets/character/character.widget';
import { WidgetContainerComponent } from './components/widget-container/widget-container.component';
import { WidgetFactoryComponent } from './components/widget-factory/widget-factory.component';

import { FocusOnLoadDirective } from './directives/focus-on-load.directive';
import { ShowLastDirective } from './directives/show-last.directive';
import { WidgetContainerDirective } from './directives/widget-container.directive';

import { LayoutModule } from '@angular/cdk/layout';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { FishingWidgetComponent } from './widgets/fishing/fishing.widget';
import { ErrorDialog } from './components/error-dialog/error-dialog';
import { CommandService } from './services/command/command-service';
import { EventSubService } from './services/eventsub/eventsub.service';
import { PetWidgetComponent } from './widgets/pet/pet.widget';
import { InfoWidgetComponent } from './widgets/info/info.widget';
import { ClientDataService } from './services/client-data/client-data-service';
import { AudioPlayerService } from './services/audio-player/audio-player-service';
import { InventoryWidgetComponent } from './widgets/inventory/inventory.widget';
import { GroupWidgetComponent } from './widgets/group/group.widget';

@NgModule({
  declarations: [
    FocusOnLoadDirective,
    ShowLastDirective,
    WidgetContainerDirective,

    AppComponent,
    AuthComponent,
    GameComponent,
    ErrorDialog,

    CharacterWidgetComponent,
    InventoryWidgetComponent,
    PetWidgetComponent,
    ConsoleWidgetComponent,
    FishingWidgetComponent,
    InfoWidgetComponent,
    GroupWidgetComponent,

    WidgetContainerComponent,
    WidgetFactoryComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    LayoutModule,
    ScrollingModule,

    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatSliderModule,
    MatSnackBarModule,
  ],
  providers: [
    ClientDataService,
    CommandService,
    EventSubService,
    AudioPlayerService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
