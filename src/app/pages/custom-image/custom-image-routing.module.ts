import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomImagePage } from './custom-image.page';

const routes: Routes = [
  {
    path: '',
    component: CustomImagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomImagePageRoutingModule {}
