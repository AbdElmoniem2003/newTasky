import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";
import { environment } from "src/environments/environment";
import { EditBody } from "../../interfaces/edit";
import { TodoData } from "../../interfaces/todoData";


const baseURL: string = environment.baseURL

@Injectable({ providedIn: 'root' })


export class DataService {

  todo: TodoData;

  constructor(
    private http: HttpClient,
  ) { }


  // TodoBody | LoginRes | RegisterRes | ProfileRes
  getData(endPoint: string): Observable<any> {
    return this.http.get(baseURL + endPoint).pipe(take(1))
  }
  postData(endPoint: string, body: any): Observable<any> {
    return this.http.post(baseURL + endPoint, body).pipe(take(1))
  }
  updateData(endPoint: string, body: EditBody): Observable<any> {
    return this.http.put(baseURL + endPoint, body).pipe(take(1))
  }
  delete(endPoint: string): Observable<any> {
    return this.http.delete(baseURL + endPoint).pipe(take(1))
  }



}
