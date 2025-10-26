import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ResultadoComponent } from './resultado/resultado.component';
import { DestacadosPage } from '../destacados/destacados.page';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: false
})
export class BuscarPage implements OnInit {
  libros: any = [];
  autores: any = [];
  listaLibro : any = []; 
  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private router: Router,
    private destacado : DestacadosPage
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
    let link = this.http.get(`https://openlibrary.org/search.json?title=${title}&language=spa&fields=edition_key, cover_i, title,author_key, author_name&page=1&limit=50`)
    link.subscribe({
      next: (data) => {
        this.libros = data;
        this.libros = this.libros.docs; 
      }
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
    console.log(libro.edition_key);
    
  }
  historial(libro: any){
    let listaLibro  : string  = JSON.stringify(libro)
    localStorage.setItem('Lista libros', listaLibro)  
    
  }
}
