import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalTemaComponent } from './modal-tema/modal-tema.component';
import { ModalCuentaComponent } from './modal-cuenta/modal-cuenta.component';
import { Router } from '@angular/router';
import { AuthService } from '.././services/auth';


@Component({
  selector: 'app-pestania-config',
  templateUrl: './pestania-config.page.html',
  styleUrls: ['./pestania-config.page.scss'],
  standalone: false
})
export class PestaniaConfigPage implements OnInit {

  nombreUsuario: string = '';
  email: string = '';

  constructor(private modalCtrl: ModalController,
        private router: Router,
    private authService: AuthService
  ) { }


  async openTemaModal() {

    const temaModal = await this.modalCtrl.create({
      component: ModalTemaComponent,
      breakpoints:[0, 0.3, 0.6, 1],
      initialBreakpoint: 0.6,
      handle: true,
      backdropDismiss: true
    });

    await temaModal.present();

    const { data, role } = await temaModal.onWillDismiss();
    console.log('Modal cerrado con:', data, role);
  }




    async openCuentaModal() {

    const cuentaModal = await this.modalCtrl.create({
      component: ModalCuentaComponent,
      breakpoints:[0, 0.3, 0.6, 1],
      initialBreakpoint: 0.6,
      handle: true,
      backdropDismiss: true
    });

    await cuentaModal.present();

    const { data, role } = await cuentaModal.onWillDismiss();
    console.log('Modal cerrado con:', data, role);
  }


 



  


  async ngOnInit() {

     const user = await this.authService.obtenerUsuario();

    if (user) {
      if (user.email) {
        this.email = user.email;
      }

      if (user.displayName) {
        this.nombreUsuario = user.displayName;
      } else {
        if (user.email) {
          const partes = user.email.split('@');
          this.nombreUsuario = partes[0];
        }
      }
    }
  }

}
