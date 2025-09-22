import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TodoData } from 'src/app/core/interfaces/todoData';
import { DataService } from 'src/app/core/services/data-service/data.service';
import { CameraService } from 'src/app/core/services/camera-service/camera.service';
import { NavController } from '@ionic/angular';



// Html to image
import { PrintService } from 'src/app/core/services/print-service/print.service';
import { Capacitor } from '@capacitor/core';
import { BluetoothDevice, CapacitorThermalPrinter } from 'capacitor-thermal-printer';
import { environment } from 'src/environments/environment';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';


@Component({
  selector: 'app-bluetooth-printer',
  templateUrl: './bluetooth-printer.page.html',
  styleUrls: ['./bluetooth-printer.page.scss'], standalone: false,
})
export class BluetoothPrinterPage implements OnInit {

  todo: TodoData;
  imageInitialized: boolean = false;
  imgKey = environment.baseURL + 'images/'
  isloading: boolean = false;
  isError: boolean = false;
  isEmpty: boolean = false;
  devices: BluetoothDevice[] = [];
  printer: BluetoothDevice = null;

  @ViewChild('eleToPrint') eleToPrint: ElementRef

  constructor(
    private dataService: DataService,
    public navCtrl: NavController,
    private printService: PrintService,
    private funcservice: FunctionsService,
  ) { }

  ngOnInit() {
    this.todo = this.dataService.todo;
  }

  async discover(ev?: any) {

    if (Capacitor.getPlatform() !== 'android') {
      this.showError(ev);
      return;
    };
    this.devices = await this.printService.discover();
    if (this.devices.length) this.showContent(ev);
    if (!this.devices.length) this.showEmpty(ev);
  }

  // start printing
  async startPrinting(eleID: string) {
    if (Capacitor.getPlatform() !== 'android') return;

    const previousConnection = await this.printService.alreadyConnect();
    if (!previousConnection) this.funcservice.genericToast({ message: 'Please Connect to a Printer' })
    if (!previousConnection) return;

    this.imageInitialized = true;
    setTimeout(async () => {
      const imageToPrint = await this.printService.prepareImage(eleID);
      await CapacitorThermalPrinter.begin().align('center')
        .image(imageToPrint).cutPaper().write()
        .then(() => {
          this.imageInitialized = false;
          alert('Printing Succedded');
        })
        .catch(() => {
          this.imageInitialized = false;
          alert('Error in printing');
        });
    }, 500);
  }


  async connectNewPrinter(address: string) {
    const isConnected = await this.printService.alreadyConnect();
    if (!this.printer?.address || !isConnected) {
      this.printer = await CapacitorThermalPrinter.connect({ address: address });
      if (this.printer) this.funcservice.genericToast({ message: `Connected to ${this.printer.name}.`, color: 'primary' });
    }
  }


  /*==================================== Print PDF */

  async printPdf() {
    this.imageInitialized = true
    await this.printService.printPdf(this.todo)
    this.imageInitialized = false
  }




  async doRefresh(ev: any) {
    this.showLoading();
    await this.discover();
    ev.target.complete(ev)
  }

  showError(ev?: any) {
    this.isloading = false;
    this.isEmpty = false;
    this.isError = true;
    ev?.target.complete();
  }
  showEmpty(ev?: any) {
    this.isloading = false;
    this.isEmpty = true;
    this.isError = false;
    ev?.target.complete();
  }
  showContent(ev?: any) {
    this.isloading = false;
    this.isEmpty = false;
    this.isError = false;
    ev?.target.complete();
  }
  showLoading() {
    this.isloading = true;
    this.isEmpty = false;
    this.isError = false;
  }

}
