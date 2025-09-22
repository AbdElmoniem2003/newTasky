import { Injectable } from "@angular/core";
import { NavController } from '@ionic/angular';

/* Print using Bluetooth */
import { BluetoothDevice, CapacitorThermalPrinter } from 'capacitor-thermal-printer';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';

// Html to image
import { toJpeg } from 'html-to-image';

//HTML2Canvas
import * as pdfMake from 'pdfmake/build/pdfmake';      // print or download or open
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { TodoData } from "../../interfaces/todoData";
import { environment } from "src/environments/environment";
import { CameraService } from "../camera-service/camera.service";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem, WriteFileResult } from "@capacitor/filesystem";

import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';



@Injectable({ providedIn: 'root' })
export class PrintService {

  imgKey = environment.baseURL + 'images/'

  constructor(
    private cameraService: CameraService,
    public navCtrl: NavController,
    private btSerial: BluetoothSerial,
    private funcservice: FunctionsService,
  ) {

  }


  private async enabelBt(): Promise<boolean> {
    return new Promise(async resolve => {
      await this.btSerial.isEnabled().then(isEnable => {
        // resolve if enabled already
        resolve(true)
      }).catch(async () => {
        // enable Bluetooth
        await this.btSerial.enable().then(() => resolve(true)).catch(() => resolve(false))
      }
      )
    })
  }



  discover(): Promise<BluetoothDevice[]> {
    return new Promise(async (resolve) => {
      let isDiscover = false;
      const enabled = await this.enabelBt();
      if (!enabled) {
        await this.funcservice.genericToast({ message: 'Enable Bluetooth Frist to access nearby Printers.' });
        resolve([]);
      } else {

        await this.clearConnections();
        const listener = await CapacitorThermalPrinter.addListener('discoverDevices', async (devices) => {
          isDiscover = devices.devices.length > 0;
          resolve(devices.devices);
        });
        await CapacitorThermalPrinter.startScan();

        setTimeout(async () => {
          if (!isDiscover) {
            listener.remove();
            await CapacitorThermalPrinter.stopScan();
            resolve([]);
            alert(`Scanning is over after 5 seconds`)
          }
        }, 5000)
      }
    })
  }

  async clearConnections(): Promise<boolean> {
    return new Promise(async (resolve) => {
      CapacitorThermalPrinter.isConnected().then(async isConnected => {
        if (isConnected) await CapacitorThermalPrinter.disconnect();
        resolve(isConnected)
      }).catch(() => resolve(false))
    })
  }


  async alreadyConnect(): Promise<boolean> {
    return new Promise(async (resolve) => {
      CapacitorThermalPrinter.isConnected().then(async isConnected => {
        isConnected ? resolve(true) : resolve(false)
      }).catch(() => resolve(false))
    })
  }


  async prepareImage(eleID: string) {
    return new Promise<string>(async (resolve) => {
      const ele: HTMLElement = document.getElementById(eleID);
      // const base64 = await htmlToImage.toJpeg(ele,
      const base64 = await toJpeg(ele,
        {
          width: ele.clientWidth || 384,
          height: ele.clientHeight,
          backgroundColor: '#ffffff',
          pixelRatio: 2, quality: 0.92,
        });
      resolve(base64);
    })
  }

  async printPdf(todo: TodoData) {
    (pdfMake as any).vfs = pdfFonts.vfs;
    const blob = await this.cameraService.getImageBlob('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/51158316-fd7e-48ca-b5fe-8542e9dfe357/dj2vk42-2fb14d4b-9687-46df-a393-b932a7f836a5.png/v1/fill/w_1354,h_590,q_70,strp/one_piece_void_century_mural_by_bodskih_dj2vk42-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTc0MyIsInBhdGgiOiJcL2ZcLzUxMTU4MzE2LWZkN2UtNDhjYS1iNWZlLTg1NDJlOWRmZTM1N1wvZGoydms0Mi0yZmIxNGQ0Yi05Njg3LTQ2ZGYtYTM5My1iOTMyYTdmODM2YTUucG5nIiwid2lkdGgiOiI8PTQwMDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.ti4KLgvHS8r_ilRZOQJu17dY9fGlSlzEzPSPoYI8cC4');
    const base64 = await this.cameraService.readImageBase64(blob);
    const docDef = {
      pageSize: 'A4',
      fit: [420, 980],
      content: [
        {
          fit: [420, 980],
          alignment: 'center',
          margin: [0, 0, 0, 0],
          image: base64,
        },
        , {
          text: `${todo.title}`,
          style: 'main', fontSize: 30
        }
        , {
          text: `${todo.desc}`,
          style: 'main', fontSize: 20
        },
        {
          style: 'tableBG',
          table: {
            heights: ['*'], widths: ['100%'],
            body: [
              [{ text: 'End Date', style: 'cell', fontSize: 10, border: [false, false, false, false] }], [{ text: todo.createdAt, style: 'cell', border: [false, false, false, false] }]
            ]
          }
        },
        {
          style: 'tableBG',
          table: {
            heights: ['*'], widths: ['100%'],
            body: [
              [{ text: todo.status, style: 'cell', border: [false, false, false, false] }]
            ]
          }
        },
        {
          style: 'tableBG',
          table: {
            heights: ['*'], widths: ['100%'],
            body: [
              [{ text: `${todo.priority} Priority`, style: 'cell', border: [false, false, false, false] }]
            ]
          }
        },

      ],
      styles: {
        main: {
          alignment: 'start',
          margin: [15, 5],
        },
        tableBG: {
          fillColor: '#87b2cc',
          borderRadius: 16
        },
        cell: {
          margin: [10, 0],
          border: [false, false, false, false],
          fontSize: 13,
          color: '#221f1e'
        }
      }
    };

    // if Web just open else download then open
    const plt = Capacitor.getPlatform();
    if (plt == 'web') {
      pdfMake.createPdf(docDef).open()
      return;
    };
    pdfMake.createPdf(docDef).getBuffer(async (res) => {
      const uri = (await this.writeFile(todo, res)).uri;
      await this.readFile(uri)
    })
  }

  // Write PDF file
  async writeFile(todo: TodoData, data: any) {
    return new Promise<WriteFileResult>((resolve, reject) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.toString().split(',')[1];
        const result = await Filesystem.writeFile({
          data: base64,
          directory: Directory.Documents,
          recursive: true,
          path: `${todo.title}-${Date.now()}.pdf`,
        });
        resolve(result);
        this.funcservice.genericToast({ message: `PDF of ${todo.title} has been created.`, color: 'primary' })
      };
      reader.readAsDataURL(blob);
    })
  }

  // Read PDF File
  async readFile(uri: string) {
    FileOpener.open({
      filePath: uri,
      contentType: 'application/pdf',
      openWithDefault: true,
    }).then(() => alert(uri)).catch((err) => alert(err))
  }

}


