import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CountryData } from 'country-codes-list';
import { AuthService } from 'src/app/core/services/auth-service/auth.service';
import { PickCountryComponent } from '../pick-country/pick-country.component';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'], standalone: false
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  country: CountryData = this.authService.country;


  constructor(
    private authService: AuthService,
    private builder: FormBuilder,
    private modalCtrl: ModalController,
    private functionService: FunctionsService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.builder.group({
      phone: ['', [Validators.required, this.authService.validatePhoneNumber(this.country.countryCode)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  login() {
    if (this.loginForm.invalid) {
      this.functionService.genericToast({ message: 'Complete the From please.', color: 'danger' })
      return
    }
    this.authService.login(this.loginForm.value);
  }

  async pickCountry() {
    const modal = await this.modalCtrl.create({
      component: PickCountryComponent,
      cssClass: 'country-modal',
      initialBreakpoint: 0.5,
    });
    await modal.present();
    const pickedCountry = (await modal.onDidDismiss()).data
    if (!pickedCountry) return
    this.country = pickedCountry;
    this.loginForm.patchValue({ phone: '' });
    this.loginForm.get('phone').setValidators([this.authService.validatePhoneNumber(this.country.countryCode)]);
    this.loginForm.get('phone').updateValueAndValidity();

  }

}
