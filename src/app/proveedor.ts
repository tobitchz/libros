import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';
import { Translate } from './services/translate';



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
  constructor(private httpClient: HttpClient, private translate: Translate) {}



/**
 * @function librosDestacados
 * @description Obtiene una lista de libros destacados con información completa incluyendo autores y portadas.
 * 
 * Esta función realiza las siguientes operaciones:
 * 1. Consulta información básica de obras literarias predefinidas en Open Library
 * 2. Obtiene información detallada de los autores de cada obra
 * 3. Combina y transforma los datos en un formato estructurado
 * 4. Proporciona URLs de portadas o una imagen por defecto cuando no está disponible
 * 
 * @returns {Observable<any[]>} Observable que emite un array de objetos con información de libros
 * 
 * @example
 * // Uso en un componente Ionic
 * librosDestacados().subscribe({
 *   next: (libros) => {
 *     console.log('Libros destacados:', libros);
 *     this.libros = libros;
 *   },
 *   error: (error) => {
 *     console.error('Error al obtener libros:', error);
 *   }
 * });
 * 
 * @example
 * // Estructura del objeto libro devuelto:
 * {
 *   id: 'OL81633W',
 *   tipo: 'works',
 *   titulo: 'El Señor de los Anillos',
 *   autor: 'J.R.R. Tolkien',
 *   portada: 'https://covers.openlibrary.org/b/id/123456-M.jpg'
 * }
 * 
 * @throws {Error} Puede lanzar errores de red o de parsing JSON si las APIs fallan
 * 
 * @remarks
 * Las obras incluidas están predefinidas y corresponden a libros clásicos y populares.
 * La función utiliza forkJoin para realizar múltiples peticiones HTTP en paralelo.
 * 
 * @see {@link https://openlibrary.org/developers/api|Open Library API}
 * @see {@link https://rxjs.dev/api/index/function/forkJoin|RxJS forkJoin}
 * @see {@link https://rxjs.dev/api/operators/switchMap|RxJS switchMap}
 * 
 */

librosDestacados(): Observable<any[]> {
  const works = [
    'OL81633W', 
    'OL82563W', 
    'OL2879525W', 
    'OL17365W', 
    'OL27448W', 
    'OL15379W', 
    'OL45804W', 
    'OL8193416W', 
    'OL98587W' 
  ];

  const requests = works.map(id =>
    this.httpClient.get<any>(`https://openlibrary.org/works/${id}.json`)
  );

  return forkJoin(requests).pipe(
    switchMap((results: any[]) => {
      const authorRequests = results.map(libro => {
        const authorKey = libro.authors?.[0]?.author?.key;
        if (!authorKey) return of(null);
        return this.httpClient.get<any>(`https://openlibrary.org${authorKey}.json`);
      });

      return forkJoin(authorRequests).pipe(
        switchMap(authors => {
          // traducir títulos en paralelo
          const traducciones = results.map(libro =>
            this.translate.traducir(libro.title)
          );

          return forkJoin(traducciones).pipe(
            map(titulosTraducidos => {
              return results.map((libro, i) => {
                const autor = authors[i]?.name || 'Desconocido';
                const titulo = titulosTraducidos[i] || libro.title;

                return {
                  id: libro.key.replace('/works/', ''),
                  tipo: 'works',
                  titulo,
                  autor,
                  portada: libro.covers?.length
                    ? `https://covers.openlibrary.org/b/id/${libro.covers[0]}-M.jpg`
                    : 'assets/imagenes/sin_portada.jpg'
                };
              });
            })
          );
        })
      );
    })
  );
}



}