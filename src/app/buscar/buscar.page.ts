import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ResultadoComponent } from './resultado/resultado.component';
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
    private modalController: ModalController,
    private router: Router
  ) { }




  ngOnInit() {
  }


  getAuthor(nombreAut: string) {
    let linkAut = this.http.get(`https://openlibrary.org/search.json?author=${nombreAut}`)
    linkAut.subscribe(
      {
        next: (data) => {
          this.autores = data;
          this.autores = this.autores.docs
          console.log(this.autores.author_name)
        }
      }
    )
  }

  getLibros(title: string) {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&fields=edition_key,cover_i,title,author_key,author_name&page=1&limit=50`;

    this.http.get<any>(url).subscribe({
    next: (data) => {
      this.libros = data.docs;
      console.log(this.libros);
    },
    error: (err) => console.error('error libros:', err)
  });
  }

  buscar(event: Event) {
    let valor = (event.target as HTMLIonSearchbarElement).value
    if (valor) {
      this.getLibros(String(valor))
 
    }
    else {
      this.libros = []
    }

  }

  async respuesta(libro: any) {
  const id = libro.edition_key?.[0];
  if (!id) {
    console.error('error key');
    return;
  }
  this.router.navigate(['/libro', { id, tipo: 'books' }]);
}

}
