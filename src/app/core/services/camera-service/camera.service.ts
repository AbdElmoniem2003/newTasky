import { Injectable } from "@angular/core";
import { ActionSheetController, ActionSheetOptions, AlertController } from "@ionic/angular";

import { Photo, CameraResultType, CameraSource, ImageOptions, Camera } from "@capacitor/camera"
import { readAndCompressImage, Config } from "browser-image-resizer"


const CAMERA = 'CAMERA'
const PHOTOS = "PHOTOS"
const RESET = "RESET"

@Injectable({ providedIn: 'root' })

export class CameraService {

  constructor(
    private actionCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) { }


  chooseImageSource(img?: string) {
    return new Promise<string>(async (resolve, reject) => {

      const opts: ActionSheetOptions = {
        mode: 'ios',
        cssClass: 'custom-action-sheet',
        header: 'Choose the Image Source',
        buttons: [{
          text: 'camera',
          handler: () => resolve(CAMERA)
        },
        {
          text: 'Gallery',
          handler: () => resolve(PHOTOS)
        }, {
          text: 'Cancel', role: "cancel",
        }]
      }

      img ? opts.buttons.push({
        text: 'Reset',
        handler: () => {
          resolve(RESET)
        }
      }) : null

      const action = await this.actionCtrl.create(opts)

      await action.present()
    })
  }


  getImage(img?: string): Promise<Photo | null> {
    return new Promise(async (resolve, reject) => {
      const opts: ImageOptions = {
        resultType: CameraResultType.Uri,
        quality: 75,
        saveToGallery: true,
      }

      const source = await this.chooseImageSource(img)

      if (source == CAMERA) {
        opts.source = CameraSource.Camera;
        resolve(await Camera.getPhoto(opts))
      } else if (source == PHOTOS) {
        opts.source = CameraSource.Photos;
        resolve(await Camera.getPhoto(opts))
      }
      else if (source == RESET) {
        resolve(null)
      }
    })
  }

  async getImageBlob(img: string) {
    return new Promise<Blob>(async (resolve, reject) => {
      fetch(img).then(async (res) => {
        const blob = await res.blob();
        resolve(blob)
      }).catch(err => resolve(null))
    })
  }

  readImageBase64(blob: Blob): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        resolve(reader.result)
      }
    })
  }

  // getBlobOfStringData(data: string) {
  //   return new Blob([data], { type: 'image/jpeg' })  // image/*  =>  suport creating a blob of all images string of images from all extentions
  // }


  resizeImage(imgBlob: Blob) {
    const configs: Config = {
      quality: 0.6,
      maxWidth: 500,
      maxHeight: 700,
    };
    return new Promise<Blob>(async (resolve, reject) => {
      const resizedBlob = await readAndCompressImage(imgBlob as File, configs);
      resolve(resizedBlob)
    })
  }

}
