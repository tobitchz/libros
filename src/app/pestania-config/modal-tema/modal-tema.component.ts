import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-tema',
  templateUrl: './modal-tema.component.html',
  styleUrls: ['./modal-tema.component.scss'],
  standalone: false
})
export class ModalTemaComponent {
  seleccionado = '';

  constructor(private modalCtrl: ModalController) {}

  elegir(opcion: string) {
    this.seleccionado = opcion;
  }

    cancel() {
    this.modalCtrl.dismiss();
  }

  confirm() {

    this.modalCtrl.dismiss(this.seleccionado, 'confirmar');
  }
}
