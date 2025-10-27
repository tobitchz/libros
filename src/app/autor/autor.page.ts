import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-autor',
  templateUrl: './autor.page.html',
  styleUrls: ['./autor.page.scss'],
  standalone: false,
})
export class AutorPage implements OnInit {
  autor: any = {};
  obras: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getAutor(id);
  }

  getAutor(id: string) {
    const urlAutor = `https://openlibrary.org/authors/${id}.json`;
    const urlObras = `https://openlibrary.org/authors/${id}/works.json?limit=20`;

    this.http.get<any>(urlAutor).subscribe({
      next: (data) => (this.autor = data),
      error: (err) => console.error('Error cargando autor:', err),
    });

    this.http.get<any>(urlObras).subscribe({
      next: (data) => (this.obras = data.entries || []),
      error: (err) => console.error('Error cargando obras:', err),
    });
  }
}
