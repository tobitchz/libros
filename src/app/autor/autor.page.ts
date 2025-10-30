import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Translate } from 'src/app/services/translate';
import { Router } from '@angular/router';

@Component({
  selector: 'app-autor',
  templateUrl: './autor.page.html',
  styleUrls: ['./autor.page.scss'],
  standalone: false,
})
export class AutorPage implements OnInit {
  autor: any = {};
  obras: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private translate: Translate,
    private router: Router)
     {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getAutor(id);
  }



/**
 * Obtiene los datos del autor y sus obras desde la API de OpenLibrary.
 * 
 * Realiza dos peticiones HTTP: una para los detalles del autor (`/authors/{id}.json`)
 * y otra para sus obras (`/authors/{id}/works.json`), limitadas a 20 resultados.
 * 
 * Además, si la biografía (`bio`) está disponible, la envía al servicio de traducción
 * para obtener una versión traducida al idioma configurado.
 * 
 * @param {string} id - Identificador único del autor en OpenLibrary.
 * @returns {void}
 * 
 * @example
 * this.getAutor('OL23919A'); // Obtiene los datos de Gabriel García Márquez
 */
  getAutor(id: string) {
    const urlAutor = `https://openlibrary.org/authors/${id}.json`;
    const urlObras = `https://openlibrary.org/authors/${id}/works.json?limit=20`;

    this.http.get<any>(urlAutor).subscribe({
      next: (data) => {
        this.autor = data;

        let bio = this.autor.bio?.value || this.autor.bio;

      if (bio && typeof bio === 'string') {
        const index = bio.indexOf('([');
        if (index !== -1) {
          bio = bio.substring(0, index).trim();
        }
      }

        if (bio) {
          this.translate.traducir(bio).subscribe(traduccionBio => {
            this.autor.traduccionBio = traduccionBio;
          });
        }
      },
      error: (err) => console.error('Error cargando autor:', err),
    });

    this.http.get<any>(urlObras).subscribe({
      next: (data) => {
    this.obras = data.entries || [];
  },
      error: (err) => console.error('Error cargando obras:', err),
    
    });

   
  }

/**
 * @function verObra
 * @description Navega a la página de detalles de una obra literaria
 * @param {any} obra - Objeto obra que contiene la información de la obra
 * @returns {void}
 */
  verObra(obra: any) {
  if (!obra.key) return;
  const id = obra.key.replace('/works/', '');
  this.router.navigate(['/libro', { id, tipo: 'works' }]);
}




/**
 * @function volverAtras
 * @description Navega a la página anterior en el historial
 * @returns {void}
 */
  volverAtras() {
 this.location.back();
 }



}
