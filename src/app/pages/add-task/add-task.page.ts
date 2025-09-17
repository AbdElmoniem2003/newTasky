import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavController } from '@ionic/angular';
import { DataService } from 'src/app/core/services/data-service/data.service';
import { RefreshService } from 'src/app/core/services/refresher-service/refresher.service';
import { PickDateModalComponent } from '../pick-date-modal/pick-date-modal.component';
import { CameraService } from 'src/app/core/services/camera-service/camera.service';
import { Photo } from '@capacitor/camera';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';
import { TodoData } from 'src/app/core/interfaces/todoData';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.page.html',
  styleUrls: ['./add-task.page.scss'],
  standalone: false
})
export class AddTaskPage implements OnInit {

  addForm: FormGroup;
  todoImg: Photo;
  imgToUpload: Blob;
  renderImg: string;

  constructor(
    public navCtrl: NavController,
    private refreshService: RefreshService,
    private builder: FormBuilder,
    private dataService: DataService,
    private modalCtrl: ModalController,
    private cameraService: CameraService,
    private funcstionsService: FunctionsService
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.addForm = this.builder.group({
      image: '',
      "title": ['', Validators.required],
      "desc": [''],
      "priority": ['', Validators.required],
      "dueDate": ['', Validators.required]
    })
  }

  async pickDate() {
    const modal = await this.modalCtrl.create({
      cssClass: 'time-modal',
      component: PickDateModalComponent,
      componentProps: {
        currentValue: new Date(),
      }
    });
    await modal.present();
    const date: Date = (await modal.onDidDismiss()).data;
    if (!date) return;
    this.addForm.patchValue({ dueDate: date })
  }

  async addImage(img?: string) {
    this.todoImg = await this.cameraService.getImage(img);
    if (!this.todoImg) return this.renderImg = null;
    console.log(this.todoImg);
    const imgBlob = await this.cameraService.getImageBlob(this.todoImg.webPath);
    this.imgToUpload = await this.cameraService.resizeImage(imgBlob);
    const base64 = await this.cameraService.readImageBase64(this.imgToUpload);
    this.renderImg = (base64 as string);
  }


  uploadImg(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.imgToUpload) {
        resolve('path.png')
      } else {
        const formData: FormData = new FormData();
        console.log(this.imgToUpload);
        // const file = new File([this.imgToUpload], 'photo.jpg', { type: this.imgToUpload.type });
        formData.append('image', this.imgToUpload, `photo.${this.todoImg.format}`);
        this.dataService.postData(`upload/image`, formData).subscribe({
          next: (res) => {
            console.log(res)
            resolve(res.image)
          }, error: err => {
            this.funcstionsService.genericToast({ message: err.message })
          }
        })
      }
    })
  }

  async addTodo() {
    this.addForm.patchValue({ image: await this.uploadImg() })
    console.log(this.addForm.value)
    this.dataService.postData(`todos`, this.addForm.value).subscribe({
      next: (res: TodoData) => {
        console.log(res)
        this.refreshService.refreshBS.next({ todo: res, case: true });
        this.navCtrl.navigateForward('home');
      }, error: (err) => {
        this.funcstionsService.genericToast({ message: err.essage });
        console.log(err)
      },
    })
  }

}
