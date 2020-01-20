import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  { path: 'play', component: GameComponent },
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
