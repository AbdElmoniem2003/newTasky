import { Component, inject } from '@angular/core';
import { AuthService } from './core/services/auth-service/auth.service';
import { NavController } from '@ionic/angular';
import { FunctionsService } from './core/services/functions-service/functions.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private navCtrl: NavController,
    private authService: AuthService, private functionsService: FunctionsService
  ) {
    inject(AuthService)
  }

  ngOnInit() {
    this.checkProfile();
    this.functionsService.checkDarkThemes()
  };


  async checkProfile() {
    const profile = await this.authService.createStorage();
    if (profile) { await this.navCtrl.navigateRoot('home') } else { await this.navCtrl.navigateRoot('start'); }
    if (Capacitor.getPlatform() !== 'web') await SplashScreen.hide()
  }

}
