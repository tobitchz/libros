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

  /**
   * 
   * @var seleccionado es el tema default con el que se inicia la app pero en ngOnInit
   * se pisa con lo que diga ThemeService
   *
   */
  seleccionado = 'system';

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private theme: ThemeService
  ) {}


  /**
   * 
   * @method ngOnInit es un metodo de ionic
   * 
   * inicializa el componente cargando la preferencia actual del tema
   */
  ngOnInit(){
    this.seleccionado = this.theme.getPref();
  }

  /**
   * 
   * @method elegir()
   * 
   * asigna la opcion seleccionada como tema seleccionado
   * 
   * @param opcion tema elegido por el usuario
   * 
   */

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
    this.modalCtrl.dismiss(null, 'cancel');
  }


  /**
   * 
   * @method confirm()
   * 
   * 
   * confirma la seleccion del tema
   * si no se elige tema, muestra un mensaje d error 
   * 
   * 
   */

  async confirm() {
    if(!this.seleccionado){
      const t = await this.toastCtrl.create({message: ' Elegi una opcion', duration: 1500})
      await t.present();
      return;
    }
    this.modalCtrl.dismiss(this.seleccionado, 'confirm');
  }
}
