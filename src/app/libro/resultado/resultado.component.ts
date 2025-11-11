import { Component, input, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
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
  constructor(
    private http: HttpClient,
    private router: Router,
    private modalCtr: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.getLibroKey(this.libros)
  }

/**
 * @function getLibroKey
 * @description La finalidad de esta funcion es buscar las ediciones del libro que se paso como parametro del page libro y guardarlas en el array 
 * librosKey
 * 
 */
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


  /**
   * @function verEdicion
   * @description Lo que  hace esta funcion es buscar la edicion del libro mediante un codigo que tiene guardado el libro
   */
  async verEdicion(libro: any) {
    try {
      let codeLibro = libro.source_records[0].split(":")
      console.log(codeLibro)
      console.log(libro)
      if (codeLibro[0] == "amazon" || codeLibro[0] == "bwb") {
        const alert = await this.alertController.create({
          message: 'El libro se puede buscar.',
          buttons: [{
            text: 'Buscar libro',
            handler: () => {

              if (codeLibro[0] == 'amazon') {
                libro = libro
                window.open('https://www.amazon.com/dp/' + codeLibro[1])
              }
              else {
                if (codeLibro[0] == 'bwb') {
                  window.open('https://www.betterworldbooks.com/search/results?q=' + codeLibro[1])
                }
              }
            }
          }]
        });
        await alert.present();
      }
      else {
        const toast = await this.toastController.create({
          message: 'no se pudo encontrar el libro',
          duration: 1500,
          position: 'bottom',
          color:'danger'
        });

        await toast.present();
      }
    }
    catch (error) {
      const toast = await this.toastController.create({
        message: 'no se pudo encontrar el libro',
        duration: 1500,
        position: 'bottom',
        color:'danger'
      });
      await toast.present();
    }

  }
  /**
   * @function volverAtras
   * @description Lo que hace esta funcion es cerra el modal y mostrar directamente el card del libro buscado
   */
  volverAtras() {
    this.modalCtr.dismiss()
  }

}
