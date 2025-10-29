import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';


@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: false
})
export class BuscarPage implements OnInit {
  libros: any = [];
  autores: any = [];
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
  }

 getLibros(title: string) {
  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&language=spa&fields=key,cover_i,title,author_name&page=1&limit=50`;

  this.http.get<any>(url).subscribe({
    next: (data) => {
      this.libros = data.docs.map((libro: any) => ({
        key: libro.key, // mantiene la propiedad "key"
        title: libro.title, // mantiene "title" como antes
        author_name: libro.author_name, // mantiene el mismo nombre
        cover_i: libro.cover_i // mantiene el mismo nombre
      }));
      console.log('Obras encontradas:', this.libros);
    },
    error: (err) => console.error('Error obteniendo obras:', err)
  });
}


timeout: any;

buscar(event: Event) {
  clearTimeout(this.timeout);

  const valor = (event.target as HTMLIonSearchbarElement).value?.trim();

  if (!valor || valor.length < 3) {
    this.libros = [];
    return;
  }

  // Espera 400 ms para evitar llamadas por cada tecla
  this.timeout = setTimeout(() => {
    const texto = valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quita acentos
      .replace(/\s+/g, '+'); // convierte espacios en '+'

    this.getLibros(texto);
  }, 400);
}


respuesta(libro: any) {
  const id = libro.key?.replace('/works/', '');
  if (!id) {
    console.error('Error: obra sin ID');
    return;
  }
  this.router.navigate(['/libro', { id, tipo: 'works' }]);
}


}