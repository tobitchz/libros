import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalTemaComponent } from './modal-tema/modal-tema.component';
import { ModalCuentaComponent } from './modal-cuenta/modal-cuenta.component';
import { Router } from '@angular/router';
import { AuthService } from '.././services/auth';
import { ThemeService, ThemePref } from '../services/theme';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-pestania-config',
  templateUrl: './pestania-config.page.html',
  styleUrls: ['./pestania-config.page.scss'],
  standalone: false
})
export class PestaniaConfigPage implements OnInit, OnDestroy {

  nombreUsuario: string = '';
  email: string = '';
  fotoUrl: string | null = null;

  private sub?: Subscription;


  constructor(private modalCtrl: ModalController,
    private router: Router,
    private authService: AuthService,
    public theme: ThemeService
  ) { }


   async ngOnInit() {
    await this.cargarUsuario()

     this.sub = this.authService.user$.subscribe(u => {
      if (u) {
        this.email = u.email ?? '';
        this.nombreUsuario = u.displayName ?? (u.email ? u.email.split('@')[0] : '');
        // uso photoURL si existe; si no, recién ahí caigo al fallback local
        this.fotoUrl = u.photoURL ?? localStorage.getItem('fotoPerfil');
      } else {
        this.email = '';
        this.nombreUsuario = '';
        this.fotoUrl = null;
      }
    });
  }

  async ionWillEnter() {
    await this.cargarUsuario();
    await this.authService.refreshUser();

  }

    ngOnDestroy() {
    this.sub?.unsubscribe();
  }

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
      await this.authService.refreshUser();
    }



    console.log('Modal cerrado con:', data, role);
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
