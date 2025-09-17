import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditTaskPageRoutingModule } from './edit-task-routing.module';

import { EditTaskPage } from './edit-task.page';
import { CustomImagePageModule } from '../custom-image/custom-image.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    IonicModule,
    EditTaskPageRoutingModule,
    CustomImagePageModule, LazyLoadImageModule
  ],
  declarations: [EditTaskPage]
})
export class EditTaskPageModule { }
