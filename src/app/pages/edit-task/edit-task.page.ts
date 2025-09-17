import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavController } from '@ionic/angular';
import { TodoData } from 'src/app/core/interfaces/todoData';
import { CameraService } from 'src/app/core/services/camera-service/camera.service';
import { DataService } from 'src/app/core/services/data-service/data.service';
import { RefreshService } from 'src/app/core/services/refresher-service/refresher.service';
import { Photo } from '@capacitor/camera';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';
import { environment } from 'src/environments/environment';
import { PickDateModalComponent } from '../pick-date-modal/pick-date-modal.component';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.page.html',
  styleUrls: ['./edit-task.page.scss'],
  standalone: false
})
export class EditTaskPage implements OnInit {


  editForm: FormGroup
  todoToEdit: TodoData;
  todoImg: Photo;
  imgToUpload: Blob;
  renderImg: string;
  imageKey: string = environment.baseURL + 'images/'

  constructor(
    private builder: FormBuilder,
    private dataService: DataService,
    private cameraService: CameraService,
    private refreshService: RefreshService,
    private functionsService: FunctionsService,
    public navCtrl: NavController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.todoToEdit = this.dataService.todo;
    this.renderImg = this.todoToEdit.image != 'path.png' ? `${this.imageKey}${this.todoToEdit.image}` : '../../../assets/imgs/alt-image.svg'
    this.initForm();
  }

  initForm() {
    this.editForm = this.builder.group({
      image: '',
      "title": [this.todoToEdit.title, Validators.required],
      "desc": [this.todoToEdit.desc],
      "priority": [this.todoToEdit.priority, Validators.required],
      "status": [this.todoToEdit.status, Validators.required],
      "dueDate": [this.todoToEdit.updatedAt, Validators.required]
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
    this.editForm.patchValue({ dueDate: date })
  }

  async addImage(img?: string) {
    this.todoImg = await this.cameraService.getImage(img);

    if (!this.todoImg) {
      console.log('reset')
      if (this.imgToUpload) {
        this.renderImg = `${this.imageKey}${this.todoToEdit.image}`
        this.imgToUpload = null
      } else {
        this.renderImg = null;
        console.log('reset origin')
      }
    } else {
      const imgBlob = await this.cameraService.getImageBlob(this.todoImg.webPath);
      this.imgToUpload = await this.cameraService.resizeImage(imgBlob);
      const base64 = await this.cameraService.readImageBase64(this.imgToUpload);
      this.renderImg = (base64 as string);
    }
  }


  uploadImg(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.imgToUpload) {
        resolve(this.renderImg ? this.todoToEdit.image : 'path.png')
      } else {
        const formData: FormData = new FormData();
        formData.append('image', this.imgToUpload);
        this.dataService.postData(`upload/image`, formData).subscribe({
          next: (res: { image: string }) => {
            resolve(res.image)
          }, error: err => {
            this.functionsService.genericToast({ message: err.message })
          }
        })
      }
    })
  }

  async editTodo() {
    this.editForm.patchValue({ image: await this.uploadImg() })
    this.dataService.updateData(`todos/${this.todoToEdit._id}`, this.editForm.value).subscribe({
      next: (res: TodoData) => {
        console.log(res);
        this.refreshService.refreshBS.next({ todo: res, case: true });
        this.navCtrl.navigateBack('home')
      }, error: err => {
        this.functionsService.genericToast({ message: err.error.message })
      }
    })
  }

}
