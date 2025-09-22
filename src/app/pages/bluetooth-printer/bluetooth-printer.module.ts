import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BluetoothPrinterPageRoutingModule } from './bluetooth-printer-routing.module';

import { BluetoothPrinterPage } from './bluetooth-printer.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BluetoothPrinterPageRoutingModule, LazyLoadImageModule
  ],
  declarations: [BluetoothPrinterPage]
})
export class BluetoothPrinterPageModule { }
