import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { Translate } from '../services/translate';




/**
 * Componente encargado de mostrar el detalle de un libro obtenido desde la API de OpenLibrary.
 * Permite consultar los datos del libro y acceder a enlaces de compra externos.
 */


@Component({
  selector: 'app-libro',
  templateUrl: './libro.page.html',
  styleUrls: ['./libro.page.scss'],
  standalone: false,
})

export class LibroPage implements OnInit {
  libroId: string | null = null;
  libro: any;
  
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
    private translate: Translate
    
  ) {}


  /**
   * Se ejecuta al inicializar el componente.
   * Obtiene el parámetro `id` de la URL y carga los detalles del libro.
   */
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.libroId = params.get('id');
      if (this.libroId) {
        this.getLibroDetalle(this.libroId);
      }
    });
  }

  /**
   * Obtiene los datos detallados del libro en español desde la API de OpenLibrary. 
   * @param {string} id - Identificador del libro (por ejemplo, "OL12345W").
   */
getLibroDetalle(id: string) {
  const url = `https://openlibrary.org/works/${id}.json`;

  this.http.get(url).subscribe({
    next: (data) => {
      this.libro = data;
      console.log('Detalle del libro:', this.libro);

      const texto = this.libro.description?.value || this.libro.description || this.libro.title;

      if (texto) {
        this.translate.traducir(texto).subscribe(traduccion => {
          this.libro.traduccion = traduccion;
          this.cdr.detectChanges();
        });
      }
    },
    error: (err) => console.error('Error cargando detalle:', err)
  });
}
  


  /**
   * Obtiene el slug del autor (nombre en minúsculas y con guiones).
   * Si hay varios autores, los concatena con guiones.
   * @returns {Promise<string>} Slug del autor o 'desconocido' si no hay datos.
   */
  async getAutoresSlug(): Promise<string> {
  if (!this.libro || !this.libro.authors) return 'desconocido';

  const promesas = this.libro.authors.map(async (a: any) => {
    const fullKey = a.author?.key;
    if (fullKey) {
      try {
        const authorId = fullKey.split('/').pop(); 
        const authorData: any = await this.http.get(`https://openlibrary.org/authors/${authorId}.json`).toPromise();
        return authorData.name.toLowerCase().normalize('NFD')
          .replace(/\s+/g, '-');
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
   * Muestra una alerta con enlaces para comprar el libro en Mercado Libre o Amazon.
   * Usa el título del libro y el slug del autor para construir las URLs.
   */
  async mostrarAlerta() {
     const titulo = this.libro?.title || "libro"; 
     const autor = await this.getAutoresSlug(); 

    const alert = await this.alertCtrl.create({
     header: 'COMPRAR',
    message: 'Ir a paginas de compra',
    buttons: [
   
      {
        text: 'Mercado Libre',
        handler: () => {
          
          window.open('https://listado.mercadolibre.com.ar/'+ titulo +'-'+ autor);
        }
      },
      {
        text: 'Amazon',
        handler: () => {
          
          window.open('https://www.amazon.es/s?k='+ titulo+'-'+ autor);
        }
      }
    ]
  });

  await alert.present();
}
}
