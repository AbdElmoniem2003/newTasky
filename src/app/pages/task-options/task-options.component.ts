import { Component, OnInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-task-options',
  templateUrl: './task-options.component.html',
  styleUrls: ['./task-options.component.scss'],
  imports: [
    IonicModule,
  ]
})
export class TaskOptionsComponent implements OnInit {

  constructor(
    private popooverCtrl: PopoverController
  ) { }

  ngOnInit() { }

  dismiss(option: string) {
    this.popooverCtrl.dismiss(option)
  }
}
