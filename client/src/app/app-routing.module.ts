import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LendComponent } from './lend/lend.component';

const routes: Routes = [
  { path: 'lend/:slug', component: LendComponent },
  { path: '', redirectTo: '/lend/otherdeed', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
