import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomImagePageRoutingModule } from './custom-image-routing.module';

import { CustomImagePage } from './custom-image.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomImagePageRoutingModule,
    LazyLoadImageModule
  ],
  declarations: [CustomImagePage],
  exports: [CustomImagePage]
})
export class CustomImagePageModule { }
