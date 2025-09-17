
import {
  Component,
  Input,
  OnChanges,
  OnInit,
} from "@angular/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { CameraService } from "src/app/core/services/camera-service/camera.service";
import { DataService } from "src/app/core/services/data-service/data.service";
import { environment } from "src/environments/environment";


@Component({
  selector: "app-custom-image",
  templateUrl: "./custom-image.page.html",
  styleUrls: ["./custom-image.page.scss"],
  standalone: false,
})

export class CustomImagePage implements OnChanges, OnInit {

  @Input() loadingImg: string = '../../../assets/imgs/BBNI.gif';
  @Input() altImg: string = '../../../assets/imgs/alt-image.svg';

  imgKey: string = `${environment.baseURL}images/`
  @Input() mainImg: string;
  viewImg: string = '';

  constructor(
    private cameraService: CameraService,
    private dataService: DataService
  ) { }

  ngOnInit() { }

  ngOnChanges() {
    // To update the process of getting the image on every change detected
    this.updateImages()
  }

  checkCached() {
    console.log('cached')
    return new Promise<Blob | string>(async (resolve, reject) => {
      Filesystem.readFile({
        path: this.mainImg,
        directory: Directory.Cache
      }).then((found) => {
        resolve(found.data)
      }).catch(err => {
        resolve(null)
      })
    })
  }


  // Every thing is right but the fetch is blocked by the CROs
  async fetchApiImages() {
    console.log('fetched')
    if (this.mainImg == 'path.png') {
      this.viewImg = this.altImg;
      return
    };
    const imageBlob = await this.cameraService.getImageBlob(`${this.imgKey}${this.mainImg}`);
    console.log(imageBlob)
    if (!imageBlob) return;
    const resizedBase64 = await this.cameraService.readImageBase64(imageBlob);
    this.writeImage(resizedBase64 as string);
  }

  writeImage(data: string) {
    Filesystem.writeFile({
      path: this.mainImg,
      directory: Directory.Cache,
      data: data
    })
  }

  async updateImages() {
    if (!this.mainImg) return this.viewImg = this.altImg;  // @ Input()
    const foundData = await this.checkCached() as string;

    if (!foundData) {
      this.viewImg = `${this.imgKey}${this.mainImg}`
      return this.fetchApiImages()
    } else {
      // this.viewImg = `data:image/png;base64,` + (foundData as string);
      // this.viewImg = (foundData as string);
      // console.log(this.viewImg.length)
    }
  }
}
