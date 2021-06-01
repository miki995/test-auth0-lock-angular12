import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [ AuthGuard ],
    pathMatch: 'full',
    component: AppComponent,
  },
  {
    path: '**', component: AppComponent
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
