import { Component, OnInit } from '@angular/core';
import { PickCountryComponent } from '../pick-country/pick-country.component';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth-service/auth.service';
import { CountryData } from 'country-codes-list';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FunctionsService } from 'src/app/core/services/functions-service/functions.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'], standalone: false
})
export class RegisterPage implements OnInit {

  country: CountryData = this.authService.country;
  registerForm: FormGroup

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService,
    private builder: FormBuilder,
    private functionService: FunctionsService
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.registerForm = this.builder.group({
      phone: ['', [Validators.required, this.authService.validatePhoneNumber(this.country.countryCode)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', Validators.required],
      experienceYears: ['', Validators.required],
      address: ['', Validators.required],
      level: ['', Validators.required] //fresh , junior , midLevel , senior
    })
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
    this.registerForm.patchValue({ phone: '' });
    this.registerForm.get('phone').setValidators([this.authService.validatePhoneNumber(this.country.countryCode)]);
    this.registerForm.get('phone').updateValueAndValidity();
  }

  register() {
    if (this.registerForm.invalid) {
      this.functionService.genericToast({ message: 'Complete the From please.', color: 'danger' })
      return
    }
    this.authService.register(this.registerForm.value)
  }
}
