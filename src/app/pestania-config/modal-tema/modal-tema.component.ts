import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ThemeService } from 'src/app/services/theme';

@Component({
  selector: 'app-modal-tema',
  templateUrl: './modal-tema.component.html',
  styleUrls: ['./modal-tema.component.scss'],
  standalone: false
})
export class ModalTemaComponent {
  seleccionado = 'system';

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private theme: ThemeService
  ) {}

  ngOnInit(){
    this.seleccionado = this.theme.getPref();
  }



  elegir(opcion: string) {
    this.seleccionado = opcion;
  }

  /**
   * 
   * @method cancel()
   * 
   * 
   * se usa para cerrar el modal sin guardar nada
   */

  cancel() {
    this.modalCtrl.dismiss();
  }


  /**
   * 
   * @method confirm()
   * 
   * se usa para cerrar el modal guardando la preferencia 
   * 
   */

  async confirm() {
  if (!this.seleccionado) {
    const t = await this.toastCtrl.create({ message: ' Elegi una opcion', duration: 1500 });
    await t.present();
    return;
  }
  this.modalCtrl.dismiss({ pref: this.seleccionado }, 'confirmar');
}

}
