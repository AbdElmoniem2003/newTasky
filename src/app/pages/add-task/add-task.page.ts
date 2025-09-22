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
  resizedBlob: Blob;
  renderImg: string;

  constructor(
    public navCtrl: NavController,
    private refreshService: RefreshService,
    private builder: FormBuilder,
    private dataService: DataService,
    private modalCtrl: ModalController,
    private cameraService: CameraService,
    private functionsService: FunctionsService
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

  async addImage() {
    this.todoImg = await this.cameraService.getImage();
    const imgBlob = await this.cameraService.getImageBlob(this.todoImg.webPath);
    this.resizedBlob = await this.cameraService.resizeImage(imgBlob);
    const base64 = await this.cameraService.readImageBase64(this.resizedBlob);
    this.renderImg = (base64 as string);
  }


  uploadImg(): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData: FormData = new FormData();
      // const file = new File([this.resizedBlob], 'photo.jpg', { type: this.resizedBlob.type });
      formData.append('image', this.resizedBlob, `photo.${this.todoImg.format}`);
      this.dataService.postData(`upload/image`, formData).subscribe({
        next: (res) => {
          resolve(res.image)
        }, error: err => {
          this.functionsService.genericToast({ message: err.message })
        }
      })
    })
  }

  async addTodo() {

    if (!this.resizedBlob) return this.functionsService.genericToast({ message: 'Add an image to the task frist!', color: 'danger' })

    this.addForm.patchValue({ image: await this.uploadImg() })
    console.log(this.addForm.value)
    this.dataService.postData(`todos`, this.addForm.value).subscribe({
      next: (res: TodoData) => {
        console.log(res)
        this.refreshService.refreshBS.next({ todo: res, case: true });
        this.functionsService.genericToast({ message: `Task ${this.addForm.get('title').value} has been added`, color: 'primary' })
        this.navCtrl.pop();
      }, error: (err) => {
        this.functionsService.genericToast({ message: err.essage });
        console.log(err)
      },
    })
  }

}
