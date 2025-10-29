import { Component, input, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { concatAll } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AlertController, ModalController } from '@ionic/angular';
@Component({
  selector: 'app-resultado',
  templateUrl: './resultado.component.html',
  styleUrls: ['./resultado.component.scss'],
  standalone: false,
})
export class ResultadoComponent implements OnInit {
  @Input('libros') libros: any
  librosKey: any = []
  key: any = []
  valor: any
  constructor(
    private http: HttpClient,
    private router: Router,
    private modalCtr: ModalController,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.getLibroKey(this.libros)
  }


  getLibroKey(libro: any) {
    const linkAut = this.http.get(`https://openlibrary.org${libro.key}/editions.json`)
    linkAut.subscribe(
      {
        next: (data: any) => {
          this.librosKey = data.entries
          console.log(this.librosKey)
        }
      }
    )
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      message: 'No hay mas informacion disponible sobre la edicion.',
      buttons: ['Action'],
    });

    await alert.present();
  }
  volverAtras() {
    this.modalCtr.dismiss()
  }

}
