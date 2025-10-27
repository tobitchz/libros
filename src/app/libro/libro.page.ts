import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { Translate } from '../services/translate';
import { Location } from '@angular/common';
import { Router } from '@angular/router';


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
    private location: Location,
    private router: Router
    
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
       if (tipo == null)
    {
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
      console.log('Detalle del libro:', this.libro);

      const texto = this.libro.description?.value || this.libro.description;
      const titulo = this.libro.title;
      const publicado = this.libro.first_publish_date || 'Desconocido';

      // Esperar a que getAutoresSlug() termine
      const autor = await this.getAutoresSlug();
      this.libro.autor = autor;

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

  



   async getAutoresSlug(): Promise<string> {
     if (!this.libro || !this.libro.authors) return 'Desconocido';


  //   // array de Promesas para cada autor
    const promesas = this.libro.authors.map(async (a: any) => {
      const fullKey = a.author?.key;
      if (fullKey) {
        try {
          const authorId = fullKey.split('/').pop(); // solo la KEY del autor 
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
            // Abrir el link en una nueva pestaña
            window.open('https://listado.mercadolibre.com.ar/' + titulo + '-' + autor);
          }
        },
        {
          text: 'Amazon',
          handler: () => {
            // Abrir el link en una nueva pestaña
            window.open('https://www.amazon.es/s?k=' + titulo + '-' + autor);
          }
        }
      ]
    });

    await alert.present();
  }


 verAutor(libro: any) {
  const authorKey = libro?.authors?.[0]?.author?.key;
  if (!authorKey) {
    console.error('Libro sin author_key');
    return;
  }

  const id = authorKey.replace('/authors/', '');
  this.router.navigate(['/autor', id]);
}



 volverAtras() {
    if (this.ultimaRuta) {
      this.router.navigateByUrl(this.ultimaRuta);
    } else {
      this.router.navigate(['/tabs/destacados']);
    }
  }




}