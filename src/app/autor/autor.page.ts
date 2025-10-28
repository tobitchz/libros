import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Translate } from 'src/app/services/translate';

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
    private translate: Translate)
     {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getAutor(id);
  }

  getAutor(id: string) {
    const urlAutor = `https://openlibrary.org/authors/${id}.json`;
    const urlObras = `https://openlibrary.org/authors/${id}/works.json?limit=20`;

    this.http.get<any>(urlAutor).subscribe({
      next: (data) => {
        this.autor = data;

        let bio = this.autor.bio?.value || this.autor.bio;

        // Si existe un paréntesis, cortar el bio antes de él
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
      next: (data) => (this.obras = data.entries || []),
      error: (err) => console.error('Error cargando obras:', err),
    });
  }

  volverAtras() {
 this.location.back();
 }



}
