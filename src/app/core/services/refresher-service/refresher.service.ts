import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TodoData } from "../../interfaces/todoData";
import { CountryData } from "country-codes-list";









@Injectable({ providedIn: 'root' })
export class RefreshService {

  refreshBS: BehaviorSubject<{ todo: TodoData, case: boolean }> =
    new BehaviorSubject<{ todo: TodoData, case: boolean }>(null);

  countryPicker: BehaviorSubject<CountryData> = new BehaviorSubject<CountryData>(null);

  constructor() { }

}
