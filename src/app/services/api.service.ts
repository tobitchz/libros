import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { Libro } from '../models/libro.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * @description Busca y obtiene libros de la API OpenLibrary.
   * @param title Título del libro buscado (obligatorio)
   * @param limit Cantidad máxima de resultados (por defecto: "10")
   * @param page Nro de página a obtener, determina el punto de inicio basado en el límite (por defecto: "1")
   * @param language Idioma esperado de los libros (por defecto: "spa")
   * @param fields Campos que se quieren obtener de cada libro (por defecto: ["key", "cover_i", "title", "author_key", "author_name"])
   * @returns Devuelve un observable con array de objetos de tipo "Libro"
   */
  buscarLibros(
    title: string,
    limit: string | number = "10",
    page: string | number = "1",
    language: string = "spa",
    fields: string[] = ["key", "cover_i", "title", "author_key", "author_name"]
  ) {
    if (!title || title.trim() === "") {
      return of([]);
    }
    const params = new HttpParams()
      .set("title", title)
      .set("language", language)
      .set("fields", fields.join(','))
      .set("limit", limit)
      .set("page", page);

    return this.http.get<any>("https://openlibrary.org/search.json", { params })
      .pipe(
        map(response => {
          if (!response.docs || !Array.isArray(response.docs)) {
            return [];
          }
          return response.docs.map((libroData: any) => new Libro(libroData));
        }),
        catchError(error => {
          console.error('Error buscando libros:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene los datos de una obra desde la API de OpenLibrary.
   * @param {string} id - Identificador del libro (por ejemplo, "OL12345W").
  */
  getWork(id: string) {
    return this.http.get(`https://openlibrary.org/works/${id}.json`)
      .pipe(
        map((libroData) => new Libro(libroData)),
        catchError((error) => {
          console.error('Error al obtener el libro:', error);
          return of(null);
        })
      )
  }

  /**
   * Obtiene los datos de una obra desde la API de OpenLibrary.
   * @param {string} id Identificador de libro (por ejemplo, "OL12345W").
   */
  async getLibro(id: string) {
    return await this.http.get(`https://openlibrary.org/search.json?q=key:%22/works/${id.trim()}%22&fields=key,cover_i,title,author_key,author_name&limit=1`)
      .pipe(
        map((data) => new Libro(data)),
        catchError((error) => {
          console.error('Error al obtener el libro:', error);
          return of(null);
        })
      ).toPromise();
  }

  /**
   * Obtiene un listado de libros de la API de OpenLibrary
   * @param librosIds Array de IDs de libros
   * @returns Array de libros con datos
   */
  async getLibros(librosIds: string[]) {
    if (librosIds.length > 0) {
      try {
        const requests = librosIds.map(id => this.getLibro(id));
        const resultados = await Promise.all(requests);
        return resultados.filter(libro => libro !== null) as Libro[];
      } catch (error) {
        console.error('Error al obtener libros de API:', error);
      }
    }
    return [];
  }

}
