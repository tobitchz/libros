import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalTemaComponent } from './modal-tema/modal-tema.component';

@Component({
  selector: 'app-pestania-config',
  templateUrl: './pestania-config.page.html',
  styleUrls: ['./pestania-config.page.scss'],
  standalone: false
})
export class PestaniaConfigPage implements OnInit {
   seleccionado = 'system'
  constructor(private modalCtrl: ModalController) { }
  



 
  async openModal() {

    
    const modal = await this.modalCtrl.create({
      component: ModalTemaComponent
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    console.log('Modal cerrado con:', data, role);
  }



  editarPerfil(){
    console.log("se toco editar perfil")
  }
    
  
  cerrarSesion(){
    console.log("la sesion se cerro")
  }
  ngOnInit() {
  }

}
