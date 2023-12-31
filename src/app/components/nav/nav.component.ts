import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ApiService } from 'src/app/service/api/api.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  authenticated = false;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    const token = this.apiService.getToken();

    if (token) {
      this.authenticated = true;
    }
  }

  logout(): void {
    const token = this.apiService.getToken();

    if (token) {

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });


      this.http.post('http://localhost:8000/api/logout', {}, {
        headers, withCredentials: true,
        observe: 'response'
      })
        .pipe(
          tap((response: HttpResponse<any>) => {
            // Realizar acciones adicionales si es necesario
          }),
          catchError((error: any) => {
            // Manejar el error en caso de que ocurra
            return throwError(error);
          }),
          finalize(() => {
            // Acciones finales después de la solicitud, como limpiar el localStorage
            this.cookieService.delete('token')

            this.authenticated = false;

          })
        )
        .subscribe();
    } else {
      // Manejar el caso en el que no se obtuvo un token válido
      console.log('No se encontró un token válido');
    }
  }

}