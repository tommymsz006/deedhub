import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LendComponent } from './lend/lend.component';

const routes: Routes = [
  { path: 'lend', component: LendComponent },
  { path: '', redirectTo: '/lend', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
