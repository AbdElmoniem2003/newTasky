import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CountryData } from 'country-codes-list';

import countriesData from 'country-codes-list/dist/countriesData';

@Component({
  selector: 'app-pick-country',
  templateUrl: './pick-country.component.html',
  styleUrls: ['./pick-country.component.scss'],
  imports: [IonicModule]
})
export class PickCountryComponent implements OnInit {

  countries: CountryData[] = countriesData;
  searchCountries: CountryData[] = countriesData;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() { }

  dismiss(country: CountryData) {
    this.modalCtrl.dismiss(country)
  }

  search(ev: any) {
    const val = ev.target.value
    if (!val.trim()) this.searchCountries = this.countries;
    if (val) {
      this.searchCountries = this.countries.filter(c => {
        return (c.countryCallingCode.toLowerCase().includes(val.trim()) ||
          c.countryNameEn.toLowerCase().includes(val.trim()) ||
          c.countryNameLocal.toLowerCase().includes(val.trim()))
      })
    }
  }

}
