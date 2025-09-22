import { Injectable } from "@angular/core";
import { ActionSheetButton, ActionSheetController, AlertController, ToastController } from "@ionic/angular";
import { GenericOpts } from "../../interfaces/generic-opts";
import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";

@Injectable({ providedIn: 'root' })

export class FunctionsService {

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private actionCtrl: ActionSheetController,
  ) { }

  async genericToast(opts: GenericOpts) {
    let toast = await this.toastCtrl.create({
      message: opts.message, position: 'top',
      mode: opts.mode || 'ios',
      color: opts.color || 'danger',
      duration: opts.duration || 1200,
      cssClass: opts.cssClass || 'themed-Ctrl',
      buttons: [{
        text: "OK", role: 'cancel'
      }],
    })
    await toast.present();
  }

  async genericAlert(opts: GenericOpts) {
    return new Promise<boolean>(async (resolve, reject) => {

      let alert = await this.alertCtrl.create({
        message: opts.message,
        mode: opts.mode || 'ios',
        cssClass: opts.cssClass || 'themed-Ctrl',
        buttons: [{
          text: "Cancel", role: 'cancel',
          handler: () => resolve(false)
        }, {
          text: 'Ok',
          handler: () => { resolve(true) }
        }],
      })
      await alert.present();
    })
  }

  async genericActionSheet(options: GenericOpts) {
    const actionSheet = await this.actionCtrl.create({
      ...options,
      header: options.header,
      buttons: options.buttons as ActionSheetButton[],
    })
    await actionSheet.present();
  }

  checkDarkThemes() {
    const checkDarkOrLight = window.matchMedia('(prefers-color-scheme: dark)');
    // activate dark if dark is the default
    document.body.classList.toggle('dark', checkDarkOrLight.matches)
    this.handleStatusBar(checkDarkOrLight.matches)
    // change themes by changing system themes
    checkDarkOrLight.addEventListener(('change'), (media) => {
      document.body.classList.toggle('dark', media.matches);
      this.handleStatusBar(media.matches)
    })
  }

  async handleStatusBar(isDark: boolean) {
    if (Capacitor.getPlatform() == 'web') return;
    await EdgeToEdge.enable();
    await StatusBar.setBackgroundColor({ color: isDark ? "#242831" : "#ffffff" });
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    await EdgeToEdge.setBackgroundColor({ color: isDark ? "#242831" : "#ffffff" })
  }

  copyNumber(number: string | number) {
    Clipboard.write({ string: String(number) }).then(() => {
      this.genericToast({ message: `${number} is Copied.`, color: 'primary' })
    })
  }

}
