import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Proveedor {

  constructor(private httpClient: HttpClient) {
    
  }


  librosDestacados(): Observable<any[]> {
    // 3 consultas: Stephen King, un clásico, ciencia
    const king$ = this.httpClient.get<any>(
      'https://openlibrary.org/search.json?author=stephen+king&language=spa&limit=3'
    );
    const clasico$ = this.httpClient.get<any>(
      'https://openlibrary.org/search.json?title=don+quijote&language=spa&limit=3'
    );
    const ciencia$ = this.httpClient.get<any>(
      'https://openlibrary.org/search.json?subject=science&language=spa&limit=3'
    );

    // Ejecutar todas juntas y combinar resultados
    return forkJoin([king$, clasico$, ciencia$]).pipe(
      map(([kingRes, clasicoRes, cienciaRes]) => {
        const libros: any[] = [];

        // Tomar un par de resultados de cada grupo
        libros.push(...kingRes.docs.slice(0, 3));
        libros.push(...cienciaRes.docs.slice(0, 3));
        libros.push(...clasicoRes.docs.slice(0, 3));
        

       
        // retorna busqueda de libro con key para luego explorar en "libro"
       return libros.map(libro => {
        if (libro.edition_key && libro.edition_key.length > 0) {
          // edición concreta
          return {
            id: libro.edition_key[0],
            tipo: 'book',
            titulo: libro.title,
            autor: libro.author_name ? libro.author_name.join(', ') : 'Desconocido',
            portada: libro.cover_i
              ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`
              : null
          };
        } else {
          // fallback: usar work
          return {
            id: libro.key.replace('/works/', ''), 
            tipo: 'work',
            titulo: libro.title,
            autor: libro.author_name ? libro.author_name.join(', ') : 'Desconocido',
            portada: libro.cover_i
              ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`
              : null
          };
        }
      });
    })
  );
}
}