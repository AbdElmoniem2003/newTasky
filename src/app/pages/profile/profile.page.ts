import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ProfileRes } from 'src/app/core/interfaces/profile';
import { AuthService } from 'src/app/core/services/auth-service/auth.service';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'], standalone: false
})
export class ProfilePage implements OnInit {

  profile: ProfileRes

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private functionsService: FunctionsService
  ) { }

  copy(string: string | number) {
    this.functionsService.copyNumber(string)
  }

  ngOnInit() {
    this.profile = this.authService.profile;
  }

}
