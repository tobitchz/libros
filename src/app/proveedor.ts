import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

/**
 * Servicio encargado de obtener libros destacados desde la API pública de OpenLibrary.
 * Realiza tres consultas distintas (autor, clásico y ciencia) y combina los resultados.
 */


@Injectable({
  providedIn: 'root'
})


export class Proveedor {

  /**
   * @param httpClient Cliente HTTP de Angular utilizado para realizar peticiones a la API.
   */
  constructor(private httpClient: HttpClient) {}


  /**
   * Obtiene un conjunto de libros destacados.
   * Combina tres búsquedas distintas:
   * - Libros de Stephen King.
   * - Clásicos ("Don Quijote").
   * - Libros de ciencia.
   *
   * Cada búsqueda se limita a tres resultados en español.
   *
   * @returns Observable que emite un arreglo de libros combinados con su información básica.
   * Cada libro contiene:
   *  - `id`: identificador de la edición o de la obra.
   *  - `tipo`: `"book"` o `"work"`, según el tipo de resultado.
   *  - `titulo`: título del libro.
   *  - `autor`: autor o “Desconocido”.
   *  - `portada`: URL de la imagen de portada o `null` si no existe.
   */
  librosDestacados(): Observable<any[]> {
    
    const king$ = this.httpClient.get<any>(
      'https://openlibrary.org/search.json?author=stephen+king&language=spa&limit=3'
    );
    const clasico$ = this.httpClient.get<any>(
      'https://openlibrary.org/search.json?title=don+quijote&language=spa&limit=3'
    );
    const ciencia$ = this.httpClient.get<any>(
      'https://openlibrary.org/search.json?subject=science&language=spa&limit=3'
    );

    return forkJoin([king$, clasico$, ciencia$]).pipe(
      map(([kingRes, clasicoRes, cienciaRes]) => {

        const libros: any[] = [];

        libros.push(...kingRes.docs.slice(0, 3));
        libros.push(...cienciaRes.docs.slice(0, 3));
        libros.push(...clasicoRes.docs.slice(0, 3));
        
       return libros.map(libro => {
        if (libro.edition_key && libro.edition_key.length > 0) {
          
          return {
            id: libro.edition_key[0],
            tipo: 'books',
            titulo: libro.title,
            autor: libro.author_name ? libro.author_name.join(', ') : 'Desconocido',
            portada: libro.cover_i
              ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`
              : 'assets/imagenes/sin_portada.jpg'
          };
        } else {
          
          return {
            id: libro.key.replace('/works/', ''), 
            tipo: 'works',
            titulo: libro.title,
            autor: libro.author_name ? libro.author_name.join(', ') : 'Desconocido',
            portada: libro.cover_i
              ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`
              : 'assets/imagenes/sin_portada.jpg'
          };
        }
      });
    })
  );
}
}