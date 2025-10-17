import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: false
})
export class BuscarPage implements OnInit {
  l: any = [];
  constructor(
    private http: HttpClient
  ) { }




  ngOnInit() {
  }


  getLibro(title: string) {

    let librito = this.http.get(`https://openlibrary.org/search.json?title=${title}&language=spa&fields=key, cover_i, title,author_key, author_name&page=1&limit=50`)
    librito.subscribe({
      next: (data) => {
        this.l = data;
        this.l = this.l.docs; 
        console.log(this.l)
      }
    });
  }

  buscar(event: Event) {
    let valor = (event.target as HTMLIonSearchbarElement).value
    if (valor === "") {
      this.l = []
    }
    else {
      this.getLibro(String(valor))
    }

  }
  respuesta(event : Event){
    console.log(this.l[0].title)
  }

}
