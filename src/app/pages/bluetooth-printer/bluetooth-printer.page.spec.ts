import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BluetoothPrinterPage } from './bluetooth-printer.page';

describe('BluetoothPrinterPage', () => {
  let component: BluetoothPrinterPage;
  let fixture: ComponentFixture<BluetoothPrinterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BluetoothPrinterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
