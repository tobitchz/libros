import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalTemaComponent } from './modal-tema/modal-tema.component';
import { ModalCuentaComponent } from './modal-cuenta/modal-cuenta.component';
import { Router } from '@angular/router';
import { AuthService } from '.././services/auth';
import { ThemeService, ThemePref } from '../services/theme';


@Component({
  selector: 'app-pestania-config',
  templateUrl: './pestania-config.page.html',
  styleUrls: ['./pestania-config.page.scss'],
  standalone: false
})
export class PestaniaConfigPage implements OnInit {

  nombreUsuario: string = '';
  email: string = '';
  fotoUrl: string | null = null;

  constructor(private modalCtrl: ModalController,
    private router: Router,
    private authService: AuthService,
    public theme: ThemeService
  ) { }


  async openTemaModal() {

    const temaModal = await this.modalCtrl.create({
      component: ModalTemaComponent,
      breakpoints: [0, 0.3, 0.6, 1],
      initialBreakpoint: 0.6,
      handle: true,
      backdropDismiss: true
    });

    await temaModal.present();

    const { data, role } = await temaModal.onWillDismiss<any>();
    console.log('[tema] onWillDismiss:', data, role);

    const roleOk = role === 'confirm';
    const pref = (typeof data === 'string' ? data : data?.pref) as ThemePref | undefined;

    if (roleOk && pref) {
      console.log('[tema] setPref ->', pref);
      this.theme.setPref(pref);

    }
  }




  async openCuentaModal() {

    const cuentaModal = await this.modalCtrl.create({
      component: ModalCuentaComponent,
      breakpoints: [0, 0.3, 0.6, 1],
      initialBreakpoint: 0.6,
      handle: true,
      backdropDismiss: true
    });

    await cuentaModal.present();

    const { data, role } = await cuentaModal.onWillDismiss<{ foto?: string; nombre?: string }>();


    if (role === 'confirm') {
      if (data?.nombre) this.nombreUsuario = data.nombre;
      if (data?.foto) this.fotoUrl = data.foto;

    } else {
      const user = await this.authService.obtenerUsuario();
      await user?.reload();
      if (user?.displayName) this.nombreUsuario = user.displayName;
      this.fotoUrl = user?.photoURL ?? this.fotoUrl ?? localStorage.getItem('fotoPerfil');
    }



    console.log('Modal cerrado con:', data, role);
  }

  async ngOnInit() {
    await this.cargarUsuario()
  }

  async ionWillEnter() {
    await this.cargarUsuario();
  }


  private async cargarUsuario() {
    const user = await this.authService.obtenerUsuario();
    await user?.reload();

    if (user) {
      this.email = user.email ?? '';
      this.nombreUsuario = user.displayName ?? (user.email ? user.email.split('@')[0] : '');
      this.fotoUrl = user.photoURL ?? null;

      if (!this.fotoUrl) {
        const local = localStorage.getItem('fotoPerfil');
        if (local) {
          this.fotoUrl = local;
        }
      }
    }
  }

}
