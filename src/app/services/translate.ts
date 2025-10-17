import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GOOGLE_TRANSLATE } from './translate-k';

@Injectable({
  providedIn: 'root'
})
export class Translate {
  private readonly apiUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor(private http: HttpClient) {}

  traducir(texto: string, target = 'es') {
    if (!texto) return of('');

    const url = `${this.apiUrl}?q=${encodeURIComponent(texto)}&target=${target}&key=${GOOGLE_TRANSLATE}`;

    return this.http.get<any>(url).pipe(
      map(res => res.data?.translations?.[0]?.translatedText || texto),
      catchError(err => {
        console.warn('Error en traducción, usando texto original:', err);
        return of(texto);
      })
    );
  }
}
