import { Component } from '@angular/core';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TodoBody } from 'src/app/core/interfaces/todo';
import { TodoData } from 'src/app/core/interfaces/todoData';
import { ScanningEnum } from 'src/app/core/inums/scanning.enum';
import { AuthService } from 'src/app/core/services/auth-service/auth.service';
import { CameraService } from 'src/app/core/services/camera-service/camera.service';
import { DataService } from 'src/app/core/services/data-service/data.service';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';
import { RefreshService } from 'src/app/core/services/refresher-service/refresher.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  items: TodoData[] = []
  skip: number = 1;
  isloading: boolean = true;
  isError: boolean = false;
  isEmpty: boolean = false;
  stopLoading: boolean = false;
  imgKey = environment.baseURL + 'images/'

  filterStatus: string = 'all';
  refreshSubscription: Subscription;



  constructor(
    private dataService: DataService,
    private functionsService: FunctionsService,
    private refreshService: RefreshService,
    private navCtrl: NavController,
    private authService: AuthService,
    private camerService: CameraService
  ) { }

  ngOnInit() {
    this.getData();

    this.refreshSubscription = this.refreshService.refreshBS.subscribe({
      next: (res) => {
        if (!res) return;
        if (!res.case) {
          this.items = this.items.filter(todo => { return todo._id !== res.todo._id })
          return;
        } else {
          const found = this.items.find(todo => { return todo._id == res.todo._id });
          if (!found) this.items.unshift(res.todo);
          if (found) this.items[this.items.indexOf(found)] = res.todo
        };
        this.items.length > 0 ? this.showContent() : this.showEmpty();
      }
    })
  }

  get todosEndPoint() {
    let query = `todos?page=${this.skip}`;
    if (this.filterStatus !== 'all') query += `&status=${this.filterStatus}`
    return query
  }

  getData(ev?: any) {
    this.showLoading();
    this.dataService.getData(this.todosEndPoint).subscribe({
      next: (res: TodoData[]) => {
        this.items = res;
        this.items = (res.length > 20) ? this.items.concat(res) : res;
        this.items.length ? this.showContent(ev) : this.showEmpty(ev);
        this.stopLoading = (res.length < 20);
      }, error: () => {
        this.showError(ev);
      },
    })
  }

  async logOut() {
    const descision = await this.functionsService.genericAlert({ message: 'Sure to log out?' });
    if (!descision) return;
    console.log(descision)
    this.authService.logout();
  }


  toDetails(todo: TodoData) {
    this.dataService.todo = todo;
    this.navCtrl.navigateForward('details');
  }


  showError(ev?: any) {
    this.isloading = false;
    this.isEmpty = false;
    this.isError = true;
    this.stopLoading = true;
    ev?.target.complete();
  }
  showEmpty(ev?: any) {
    this.isloading = false;
    this.isEmpty = true;
    this.isError = false;
    this.stopLoading = true;
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


  loadMore(ev?: any) {
    this.skip += 1;
    this.getData(ev)
  }

  refresh(ev: any) {
    this.showLoading()
    this.skip = 1;
    this.getData(ev)
  }

  filter(ev: any) {
    if (this.filterStatus == ev.target.value) return;
    this.skip = 0;
    this.showLoading()
    this.filterStatus = ev.target.value;
    this.getData()
  }


  /* ===================================================  SCANNING LOGIC  ===================================================== */
  async runScanner() {
    if (Capacitor.getPlatform() == 'web') return;

    // Permisstions and dependancies
    const allowed = (await BarcodeScanner.checkPermissions()).camera;
    if (allowed == 'denied') {
      const permissions = (await BarcodeScanner.requestPermissions()).camera;
      if (permissions == 'denied') return;
    }

    const method = await this.specifyScanningMethod();
    if (!method.length) return;
    if (method == ScanningEnum.camera) this.navCtrl.navigateForward('qr-scanner');
    if (method == ScanningEnum.image) await this.scanImage()
  }

  //specifing the scanning method
  async specifyScanningMethod() {
    return new Promise<string>(async (resolve, reject) => {
      const method = this.functionsService.genericActionSheet({
        header: 'Scann Image or Scan By Camera', mode: 'ios',
        buttons: [{
          text: 'Camera',
          handler: () => resolve(ScanningEnum.camera)
        }, {
          text: 'Image',
          handler: () => resolve(ScanningEnum.image)
        }, {
          text: 'Cancel', role: 'cancel',
          handler: () => resolve(ScanningEnum.cancel)
        }]
      })
    })
  }

  // For Image Scanning
  async scanImage() {
    const photo: Photo = await this.camerService.getImage();
    if (!photo) return;
    this.showLoading()
    // document.querySelector('body').classList.add('ready-QR-code')
    await BarcodeScanner.readBarcodesFromImage({ path: photo.path, formats: [BarcodeFormat.QrCode] })
      .then(dataScanned => {
        const data = dataScanned.barcodes[0].rawValue;
        const todo: TodoBody = JSON.parse(data);
        // Add todo to the scanning user
        this.addTodo(todo)
      })
      .catch(err => {
        this.functionsService.genericToast({ message: err.error.message })
      }).finally(() => {
        document.querySelector('body').classList.remove('ready-QR-code')
      })
  }

  // // for Camera Scanning
  // async scanData() {
  //   document.querySelector('body').classList.add('ready-QR-code')
  //   await BarcodeScanner.scan({
  //     formats: [BarcodeFormat.QrCode]
  //   }).then(dataScanned => {
  //     const data = dataScanned.barcodes[0].rawValue;
  //     const todo: TodoBody = JSON.parse(data);
  //     // Add todo to the scanning user
  //     this.addTodo(todo)
  //   })
  //     .catch(err => {
  //       this.functionsService.genericToast({ message: err.error.message })
  //     }).finally(() => {
  //       document.querySelector('body').classList.remove('ready-QR-code')
  //     })
  // }


  /*   add Todo   */
  addTodo(todo: TodoBody) {
    this.dataService.postData(`todos`, todo).subscribe({
      next: (res: TodoData) => {
        this.refreshService.refreshBS.next({ todo: res, case: true })
        document.querySelector('body').classList.remove('ready-QR-code');
        this.isloading = false
      },
      error: err => {
        this.functionsService.genericToast({ message: err.error.message })
        document.querySelector('body').classList.remove('ready-QR-code');
        this.isloading = false
      }
    })
  }
  /*================================================================================================================================= */


  ngOnDestroy() {
    this.refreshSubscription.unsubscribe();
  }

}
