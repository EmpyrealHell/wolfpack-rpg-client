
import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { platformBrowser, BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { ClientDataService } from './app/services/client-data/client-data-service';
import { CommandService } from './app/services/command/command-service';
import { EventSubService } from './app/services/eventsub/eventsub.service';
import { AudioPlayerService } from './app/services/audio-player/audio-player-service';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
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
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule, LayoutModule, ScrollingModule, MatButtonModule, MatCardModule, MatDialogModule, MatDividerModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatRippleModule, MatSidenavModule, MatSlideToggleModule, MatTableModule, MatTabsModule, MatToolbarModule, MatSliderModule, MatSnackBarModule),
        ClientDataService,
        CommandService,
        EventSubService,
        AudioPlayerService,
        provideZoneChangeDetection({ eventCoalescing: true }),
    ]
})
   
  .catch(err => console.error(err));
