import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AppComponent } from './app.component';
import { ExternalRoute } from './util/external-route';
import { State } from './util/state';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'play', component: GameComponent },
  {
    path: '', canActivate: [ExternalRoute], component: ExternalRoute, data: {
      externalUrl: 'https://id.twitch.tv/oauth2/authorize',
      queryParams: {
        client_id: 'full2dvcfxpu2g8pgalowdipot41ft',
        redirect_uri: 'http://localhost:4200/auth',
        response_type: 'token',
        scope: 'chat:read whispers:read whispers:edit',
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
