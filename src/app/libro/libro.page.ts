import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { Translate } from '../services/translate';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FavoritosService } from '../services/favoritos.service';
import { ModalController } from '@ionic/angular';
import { ResultadoComponent } from './resultado/resultado.component';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Component({
  selector: 'app-libro',
  templateUrl: './libro.page.html',
  styleUrls: ['./libro.page.scss'],
  standalone: false,

})

export class LibroPage implements OnInit {
  libroId: string | null = null;
  libro: any;
  
  private ultimaRuta: string | null = null;
/**
   * Inyecta las dependencias necesarias para obtener parámetros de ruta,
   * realizar solicitudes HTTP y mostrar alertas.
   * @param {ActivatedRoute} route - Módulo que permite acceder a los parámetros de la ruta actual.
   * @param {HttpClient} http - Cliente HTTP para obtener los datos del libro y del autor.
   * @param {AlertController} alertCtrl - Controlador para generar alertas en la interfaz.
   * @param {ChangeDetectorRef} cdr - Fuerza actualización del template para la traducción
   */
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private translate: Translate,
    private router: Router,
    private navCtrl: NavController,
    public favService: FavoritosService,
    public modalCtrl : ModalController
    
  ) {
const nav = this.router.getCurrentNavigation();
    // Guarda la URL desde donde vino, si existe y no es /autor
    const prevUrl = nav?.previousNavigation?.finalUrl?.toString();
    if (prevUrl && !prevUrl.startsWith('/autor')) {
      this.ultimaRuta = prevUrl;
    }
  }


  /**
   * Se ejecuta al inicializar el componente.
   * Obtiene el parámetro `id` de la URL y carga los detalles del libro.
   */
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.libroId = params.get('id');
      const id = params.get('id');
      let tipo = params.get('tipo');
      if (tipo == null) {
        tipo = 'works'
      }
      if (id) this.getLibroDetalle(id, tipo);
    });
  }

  /**
   * Obtiene los datos detallados del libro en español desde la API de OpenLibrary. 
   * @param {string} id - Identificador del libro (por ejemplo, "OL12345W").
   */
  getLibroDetalle(id: string, tipo: string) {
    const url = `https://openlibrary.org/${tipo}/${id}.json`;

  this.http.get(url).subscribe({
    next: async (data) => { // <--- marcá el callback como async
      this.libro = data;

     this.cargarNombresAutores();

      let texto = this.libro.description?.value || this.libro.description;
      const titulo = this.libro.title;
      const publicado = this.libro.first_publish_date || 'Desconocido';

        // Esperar a que getAutoresSlug() termine
        const autor = await this.getAutoresSlug();
        this.libro.autor = autor;

      // Si existe un paréntesis, cortar el texto antes de él
      if (texto && typeof texto === 'string') {
        const index = texto.indexOf('([');
        if (index !== -1) {
          texto = texto.substring(0, index).trim();
        }
      }

      if (texto) {
        this.translate.traducir(texto).subscribe(traduccionDescription => {
          this.libro.traduccion = traduccionDescription;
          this.cdr.detectChanges();
        });
        this.translate.traducir(titulo).subscribe(traduccionTitulo => {
          this.libro.titulo = traduccionTitulo;
          this.cdr.detectChanges();
        });
        this.translate.traducir(publicado).subscribe(traduccionPublicado => {
          this.libro.publicado = traduccionPublicado;
          this.cdr.detectChanges();
        });
      }
    },
    error: (err) => console.error('Error cargando detalle:', err)
  });
}

  


/**
 * Obtiene un *slug* generado a partir de los nombres de los autores del libro actual.
 * 
 * La función consulta la API de OpenLibrary para recuperar los nombres de los autores
 * asociados a la obra almacenada en `this.libro`, normaliza los textos y los une en un
 * solo string separado por guiones.
 * 
 * @async
 * @returns {Promise<string>} Cadena con los nombres de los autores concatenados en formato slug.
 * 
 * @example
 * const slug = await this.getAutoresSlug();
 * // Resultado posible: "gabriel-garcia-marquez"
 */
   async getAutoresSlug(): Promise<string> {
     if (!this.libro || !this.libro.authors) return 'Desconocido';

    const promesas = this.libro.authors.map(async (a: any) => {
      const fullKey = a.author?.key;
      if (fullKey) {
        try {
          const authorId = fullKey.split('/').pop(); 
          const authorData: any = await this.http.get(`https://openlibrary.org/authors/${authorId}.json`).toPromise();
          return authorData.name.normalize('NFD')
            .replace(/\s+/g, ' ');
        } catch (e) {
          console.error('Error cargando autor', a.key, e);
          return '';
        }
      }
      return '';
    });

    const nombres = await Promise.all(promesas);
    return nombres.filter(n => n.trim() !== '').join('-');
  }


/**
 * @function mostrarAlerta
 * @description Muestra una alerta con opciones para comprar el libro en diferentes plataformas
 * @returns {Promise<void>}
 */
  async mostrarAlerta() {
    const titulo = this.libro?.title || "libro"; // libro slug
    const autor = await this.getAutoresSlug(); // autor slug

    const alert = await this.alertCtrl.create({
      header: 'COMPRAR',
      message: 'Ir a paginas de compra',
      buttons: [

        {
          text: 'Mercado Libre',
          handler: () => {
            window.open('https://listado.mercadolibre.com.ar/' + titulo + '-' + autor);
          }
        },
        {
          text: 'Amazon',
          handler: () => {
            window.open('https://www.amazon.es/s?k=' + titulo + '-' + autor);
          }
        },
        {
          text:'Better Worls Books',
          handler: ()=>{
            window.open('https://www.betterworldbooks.com/search/results?q='+ titulo + '%20' + autor) 
          }
        }
      ]
    });

    await alert.present();
  }



/**
 * @function cargarNombresAutores
 * @description Carga y completa los nombres de los autores de un libro consultando la API de Open Library.
 * 
 * Esta función realiza las siguientes operaciones:
 * 1. Verifica que el libro tenga autores definidos y que sea un array válido
 * 2. Para cada autor, extrae su ID y realiza una petición HTTP a la API de Open Library
 * 3. Maneja errores individuales de cada petición sin interrumpir el proceso completo
 * 4. Actualiza los nombres de los autores en el objeto libro original
 * 
 * @returns {void} No retorna ningún valor, actualiza el objeto `this.libro` directamente
 * 
 * @example
 * // Uso en un componente Ionic/Angular
 * ngOnInit() {
 *   this.obtenerLibro().then(() => {
 *     this.cargarNombresAutores();
 *   });
 * }
 * 
 * @example
 * // Estructura esperada de this.libro.authors:
 * [
 *   { author: { key: '/authors/OL12345A' } },
 *   { author: { key: '/authors/OL67890B' } }
 * ]
 * 
 * // Después de ejecutar la función:
 * [
 *   { author: { key: '/authors/OL12345A', name: 'J.K. Rowling' } },
 *   { author: { key: '/authors/OL67890B', name: 'Stephen King' } }
 * ]
 * 
 * @throws {Error} Logs errores en la consola pero no interrumpe la ejecución gracias al manejo con catchError
 * 
 * @remarks
 * - La función es segura y no falla si el libro no tiene autores o la estructura es incorrecta
 * - Utiliza forkJoin para realizar todas las peticiones HTTP en paralelo
 * - Cada petición individual está protegida con manejo de errores
 * - Los autores sin nombre se mantienen como null
 * 
 * @see {@link https://openlibrary.org/dev/docs/api/authors|Open Library Authors API}
 * @see {@link https://rxjs.dev/api/index/function/forkJoin|RxJS forkJoin}
 * @see {@link https://rxjs.dev/api/operators/catchError|RxJS catchError}
 * 
 */
cargarNombresAutores() {
  if (!this.libro?.authors || !Array.isArray(this.libro.authors) || this.libro.authors.length === 0) return;

  const requests = this.libro.authors.map((a: any) => {
    const key = a?.author?.key;
    if (!key) return of({ name: null });
    const id = key.replace('/authors/', '');
    return this.http.get<any>(`https://openlibrary.org/authors/${id}.json`).pipe(
      map(res => ({ name: res?.name || null })),
      catchError(err => {
        console.warn('Error al cargar autor', key, err);
        return of({ name: null });
      })
    );
  });

  forkJoin(requests).subscribe({
    next: (results) => {
      if (!Array.isArray(results)) {
        console.warn('Resultados inválidos en forkJoin');
        return;
      }
      results.forEach((res, i) => {
        if (this.libro.authors[i] && this.libro.authors[i].author) {
          this.libro.authors[i].author.name = res.name || null;
        }
      });
     
    },
    error: (err) => console.error('Error general en forkJoin:', err)
  });
}


/**
 * @function verAutor
 * @description Navega a la página de detalles de un autor
 * @param {any} author - Objeto autor que contiene la información del autor
 * @returns {void}
 */
 verAutor(author: any) {
  const authorKey = author?.author?.key;
  if (!authorKey) return;

  const id = authorKey.replace('/authors/', '');
  this.router.navigate(['/autor', id]);
}


 /**
   * Volver atras usando función nativa del telefono
   */
volverAtras() {
  this.navCtrl.back();
}



  /**
   * Alterna el estado de favorito de un libro
   */
  async toggleFavorito(): Promise<void> {
    if (!this.libroId) return;
    try {
      await this.favService.toggleFavorito(this.libroId);
    } catch (error) {
      console.error('Error al alternar favorito:', error);
    }
  }

  /**
   * Verifica si el libro actual está en favoritos
   */
  esFavorito() {
    return this.libroId ? this.favService.esFavorito(this.libroId) : false;
  }

  async openModal(libro: any) {
    const modal = await this.modalCtrl.create({
      component: ResultadoComponent,
      componentProps : {
        libros : libro
      }
    });
    modal.present();
   }


}