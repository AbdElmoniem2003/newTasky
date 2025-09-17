import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pick-date-modal',
  templateUrl: './pick-date-modal.component.html',
  styleUrls: ['./pick-date-modal.component.scss'],
  imports: [IonicModule],
})
export class PickDateModalComponent implements OnInit, AfterViewInit {

  ///// to make it get next 5 years too not ends in current year /////
  maxDate: string = new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString();
  @Input() presentation: string;
  @Input() currentValue: string;
  @Input() minimumDate: string;
  @ViewChild('dateTime', { static: true }) dateTime: IonDatetime;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() { }

  ngAfterViewInit() {
    if (this.currentValue) this.dateTime.value = new Date(this.currentValue).toISOString();
    if (this.minimumDate) this.dateTime.min = new Date(this.minimumDate).toISOString();
    console.log(this.currentValue, this.minimumDate)
  }

  async sellect(): Promise<void> {
    await this.dateTime.confirm();
    await this.modalCtrl.dismiss(this.dateTime.value);
  }

  async close(): Promise<void> {
    await this.dateTime.cancel();
    await this.modalCtrl.dismiss(null);
  }
}
