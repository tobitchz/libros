import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';



@Component({
  selector: 'app-libro',
  templateUrl: './libro.page.html',
  styleUrls: ['./libro.page.scss'],
  standalone: false,

})

export class LibroPage implements OnInit {
  libroId: string | null = null;
  libro: any;


  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.libroId = params.get('id');
      if (this.libroId) {
        this.getLibroDetalle(this.libroId);
      }
    });
  }

  getLibroDetalle(id: string) {
    const url = `https://openlibrary.org/works/${id}.json`;

    this.http.get(url).subscribe({
      next: (data) => {
        this.libro = data;
        console.log('Detalle del libro:', this.libro);
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
      }
    });
  }



  async getAutoresSlug(): Promise<string> {
    if (!this.libro || !this.libro.authors) return 'desconocido';


    // array de Promesas para cada autor
    const promesas = this.libro.authors.map(async (a: any) => {
      const fullKey = a.author?.key;
      if (fullKey) {
        try {
          const authorId = fullKey.split('/').pop(); // solo la KEY del autor 
          const authorData: any = await this.http.get(`https://openlibrary.org/authors/${authorId}.json`).toPromise();
          return authorData.name.toLowerCase().normalize('NFD')
            //.replace(/[\u0300-\u036f]/g, '')   // quitar acentos
            .replace(/\s+/g, '-');             // espacios a guiones
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
}
