import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ThemeService, ThemePref } from '../../services/theme';

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

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    if(!this.seleccionado){
      const t = await this.toastCtrl.create({message: ' Elegi una opcion', duration: 1500})
      await t.present();
      return;
    }
    this.modalCtrl.dismiss(this.seleccionado, 'confirm');
  }
}
