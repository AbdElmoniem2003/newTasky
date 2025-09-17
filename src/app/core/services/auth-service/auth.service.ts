import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage-angular";
import { LoginUser } from "../../interfaces/login-user";
import { DataService } from "../data-service/data.service";
import { LoginRes } from "../../interfaces/login-res";
import { RegisterUser } from "../../interfaces/register-user";
import { RegisterRes } from "../../interfaces/register-res";
import { ProfileRes } from "../../interfaces/profile";
import { FunctionsService } from "../functions-service/functions.service";
import { from } from "rxjs";
import { CountryData } from 'country-codes-list';
import countriesData from 'country-codes-list/dist/countriesData';
import { NavController } from "@ionic/angular";

// Phone Validation
import { PhoneNumberUtil, } from 'google-libphonenumber';
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

const refreshKey = 'refToken'
const accessKey = 'accToken'
const userKey = 'user'

@Injectable({ providedIn: 'root' })

export class AuthService {

  profile: ProfileRes;
  country: CountryData = countriesData.find(c => { return c.countryCode.toLowerCase() == 'eg' })
  phoneUtil = PhoneNumberUtil.getInstance()

  constructor(
    private storage: Storage,
    private dataService: DataService,
    private functionsService: FunctionsService,
    private navCtrl: NavController
  ) {
    this.createStorage()
  }

  async createStorage() {
    return new Promise<ProfileRes>(async (resolve, reject) => {
      await this.storage.create();
      this.profile = await this.storage.get(userKey);
      resolve(this.profile)
    })
  }

  set accessToken(token: string) {
    localStorage.setItem(accessKey, token)
  }
  get accessToken(): string | null {
    return localStorage.getItem(accessKey);
  }
  set refreshToken(token: string) {
    localStorage.setItem(refreshKey, token)
  }
  get refreshToken(): string | null {
    return localStorage.getItem(refreshKey)
  }

  login(body: LoginUser) {
    return this.dataService.postData("auth/login", body).subscribe({
      next: (res: LoginRes) => {
        this.saveCredintials(res);
        this.navCtrl.navigateRoot('home')
      }, error: err => {
        this.functionsService.genericToast({
          message: err.error.message
        })
      }
    })
  }

  register(body: RegisterUser) {
    return this.dataService.postData("auth/register", body).subscribe({
      next: (res: RegisterRes) => {
        this.saveCredintials(res);
        this.navCtrl.navigateRoot('home')
      }, error: err => {
        this.functionsService.genericToast({
          message: err.error.message
        })
      }
    })
  }

  getProfile() {
    this.dataService.getData("auth/profile").subscribe({
      next: (res: ProfileRes) => {
        this.profile = res;
        this.storage.set(userKey, res);
      }, error: err => {
        this.functionsService.genericToast({
          message: err.error.message
        })
      }
    })
  }

  getRefreshToken() {
    let refreshPromise = new Promise((resolve, reject) => {
      this.dataService.getData(`auth/refresh-token?token=${this.refreshToken}`).subscribe({
        next: ((res: { access_token: string }) => {
          this.accessToken = res.access_token;
          resolve(this.accessToken)
        }), error: err => reject(err)
      })
    })
    return from(refreshPromise)
  }

  saveCredintials(user: LoginRes | RegisterRes) {
    this.accessToken = user.access_token;
    this.refreshToken = user.refresh_token;
    this.getProfile()
  }

  logout() {
    this.dataService.postData(`auth/logout`, { token: this.refreshToken as string }).subscribe({
      next: () => {
        this.accessToken = '';
        this.refreshToken = '';
        this.storage.remove(userKey);
        this.navCtrl.navigateRoot('start')
      }
    })
  }

  // Validate Phone Numbers
  validatePhoneNumber(regionCode: string): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
      const phoneNumber = control.value;
      if (!phoneNumber) {
        return { required: true };
      }

      try {
        const parsedNumber = this.phoneUtil.parseAndKeepRawInput(phoneNumber, regionCode);
        if (this.phoneUtil.isValidNumber(parsedNumber)) {
          return null; // Valid phone number
        }
      } catch (error) {
        return { invalidPhoneNumber: true }; // Invalid phone number
      }
      console.log('error')
      return { invalidPhoneNumber: true };
    };
  }

}
