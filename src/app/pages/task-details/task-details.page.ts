import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { TodoData } from 'src/app/core/interfaces/todoData';
import { DataService } from 'src/app/core/services/data-service/data.service';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';
import { RefreshService } from 'src/app/core/services/refresher-service/refresher.service';
import { TaskOptionsComponent } from '../task-options/task-options.component';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.page.html',
  styleUrls: ['./task-details.page.scss'], standalone: false
})
export class TaskDetailsPage implements OnInit {

  todo: TodoData;
  imgKey = environment.baseURL + 'images/'

  constructor(
    private dataService: DataService,
    public navCtrl: NavController,
    private refreshService: RefreshService,
    private functionsService: FunctionsService,
    private popoverCtrl: PopoverController,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.todo = this.dataService.todo;
  }

  generateQRData(todo: TodoData) {
    const data = {
      image: todo.image,
      title: todo.title,
      desc: todo.desc,
      dueDate: todo.createdAt,
      priority: todo.priority,
      // status:todo.status
    };
    return JSON.stringify(data)
  }

  async openOptions(ev: Event) {
    const popover = await this.popoverCtrl.create({
      component: TaskOptionsComponent,
      cssClass: 'task-options',
      event: ev, mode: 'ios'
    });
    await popover.present();
    const option = (await popover.onDidDismiss()).data;
    if (option == 'edit') this.toEdits();
    if (option == 'print') this.navCtrl.navigateForward('bluetooth-printer');
    if (option == 'delete') {
      const ok = await this.functionsService.genericAlert({ message: ` Do you want to delete ${this.todo.title}?` });
      if (!ok) return;
      this.deleteTodo()
    }
  }

  toEdits() {
    this.navCtrl.navigateForward('edit-task')
  }

  deleteTodo() {
    this.dataService.delete(`todos/${this.todo._id}`).subscribe({
      next: (res) => {
        this.refreshService.refreshBS.next({ todo: this.todo, case: false });
        this.functionsService.genericToast({ message: `Task ${this.todo.title} has been deleted.`, color: 'primary' })
        this.navCtrl.navigateBack('home')
      }, error: err => {
        this.functionsService.genericToast({ message: err.message })
      }
    })
  }

}
