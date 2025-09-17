import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TaskDetailsPageRoutingModule } from './task-details-routing.module';
import { QRCodeComponent } from 'angularx-qrcode';
import { TaskDetailsPage } from './task-details.page';
import { CustomImagePageModule } from '../custom-image/custom-image.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaskDetailsPageRoutingModule,
    QRCodeComponent,
    CustomImagePageModule,
    LazyLoadImageModule
  ],
  declarations: [TaskDetailsPage]
})
export class TaskDetailsPageModule { }
