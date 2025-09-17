import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { NavController } from '@ionic/angular';
import { TodoBody } from 'src/app/core/interfaces/todo';
import { TodoData } from 'src/app/core/interfaces/todoData';
import { DataService } from 'src/app/core/services/data-service/data.service';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';
import { RefreshService } from 'src/app/core/services/refresher-service/refresher.service';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.page.html',
  styleUrls: ['./qr-scanner.page.scss'], standalone: false
})
export class QrScannerPage implements OnInit, AfterViewInit {

  constructor(
    public navCtrl: NavController,
    private dataService: DataService,
    private functionsService: FunctionsService,
    private refreshService: RefreshService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {

    this.startScanning()
  }


  async startScanning() {
    document.querySelector('body').classList.add('scanning-mode')
    BarcodeScanner.addListener('barcodesScanned', (result) => {
      const value = result.barcodes[0]?.rawValue;
      const todo: TodoData = JSON.parse(value);
      if (value) {
        BarcodeScanner.stopScan();
        BarcodeScanner.removeAllListeners();
        this.addTodo(todo)
      }
    });

    await BarcodeScanner.startScan({
      formats: [BarcodeFormat.QrCode],
    });
  }

  //  add Todo
  addTodo(todo: TodoData) {
    this.dataService.postData(`todos`, todo).subscribe({
      next: (res: TodoData) => {
        res.status
        this.refreshService.refreshBS.next({ todo: res, case: true })
        document.querySelector('body').classList.remove('scanning-mode');
        this.navCtrl.pop()
      },
      error: err => {
        this.functionsService.genericToast({ message: err.error.message })
        document.querySelector('body').classList.remove('scanning-mode');
        this.navCtrl.pop()
      }
    })
  }

  async cancel() {
    await BarcodeScanner.stopScan();
    BarcodeScanner.removeAllListeners();
    document.querySelector('body').classList.remove('scanning-mode');
    this.navCtrl.navigateBack('home')
  }

  async ngOnDestroy() {
    await BarcodeScanner.stopScan();
    BarcodeScanner.removeAllListeners();
    document.querySelector('body').classList.remove('scanning-mode');
  }
}


