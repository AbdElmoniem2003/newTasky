import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../services/auth-service/auth.service';
import { NavController } from '@ionic/angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private navCtrl: NavController,
    private authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.addToken(req, next).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          switch (err.status) {
            case 401:  // needs a access token
              if (err.url?.includes('login') || err.url?.includes('regsiter')) return throwError(() => err);
              return this.handleError_401(req, next);

            case 403:  // refresh token is expired
              return this.logoutUser()

            default:
              return throwError(() => err)
          }
        }
        else { return throwError(() => err) }
      }))
  }


  addToken(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.accessToken;
    let clonnedReq = req.clone({
      setHeaders: {
        'Authorization': 'Bearer ' + token
      }
    });
    return next.handle(clonnedReq);
  }

  handleError_401(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.getRefreshToken().pipe(take(1), switchMap(() => {
      return this.addToken(req, next)
    }))
  }

  logoutUser() {
    this.authService.logout()
    this.navCtrl.navigateRoot('start')
    return EMPTY
  }




}
