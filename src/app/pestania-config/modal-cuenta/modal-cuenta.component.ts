import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-cuenta',
  templateUrl: './modal-cuenta.component.html',
  styleUrls: ['./modal-cuenta.component.scss'],
  standalone: false
})
export class ModalCuentaComponent implements OnInit {



  constructor(private modalCtrl: ModalController,
    private modalAlert: AlertController,
    private authService: AuthService,
    private router: Router) { }

  async ngOnInit() {

  }

  async confirmDelete() {
    const alert = await this.modalAlert.create({
      header: 'Eliminar cuenta',
      message: 'Esto borrara tu cuenta, esta accion es irreversible ¿Queres continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.pedirContrasenia()
        }
      ]
    });
    await alert.present();
  }


  private async pedirContrasenia() {
    const alert = await this.modalAlert.create({
      header: 'Confirmar contraseña',
      message: 'Ingresá tu contraseña para confirmar la eliminación de la cuenta',
      inputs: [
        { name: 'password', type: 'password', placeholder: 'contraseña' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async (data) => {
            const pw = (data?.password ?? '').trim();
            if (!pw) {
              return false;
            }
            await this.eliminarCuenta(pw);

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async cambiarPassword() {
    const alert = await this.modalAlert.create({
      header: 'Cambia contraseña',
      message: 'Ingresá tu nueva contraseña ',
      inputs: [
        { name: 'actual', type: 'password', placeholder: 'contraseña actual' },
        { name: 'passwordNueva', type: 'password', placeholder: 'nueva contraseña' },
        { name: 'passwordRepetida', type: 'password', placeholder: 'repeti contraseña' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cambiar',
          role: 'destructive',
          handler: async (data) => {

            const password = (data?.actual ?? '').trim();
            const nuevaPassword = (data?.passwordNueva ?? '').trim();
            const repetirPassword = (data?.passwordRepetida ?? '').trim();

            if (!password || !nuevaPassword || !repetirPassword) {
              const err = await this.modalAlert.create({
                header: 'Error',
                message: 'Completa todos los campos.',
                buttons: ['OK']
              });
              await err.present();
              return false;
            }

            if(nuevaPassword.length < 8){
              const err = await this.modalAlert.create({
              header: 'Error',
              message: 'La nueva contraseña debe tener al menos 8 caracteres.',
              buttons: ['OK']
            });
            await err.present();
            return false;
            }


            if(nuevaPassword !== repetirPassword){

              const err = await this.modalAlert.create({
                header :' Error',
                message: 'Las contraseñas no coinciden',
                buttons: ['Ok']
              });
              await err.present();
              return false;




            }


            const loading = await this.modalAlert.create({
            header: 'Actualizando...',
            message: 'Un momento por favor',
            backdropDismiss: false
          });
          await loading.present();


           try {
            await this.authService.cambiarContrasenia(password, nuevaPassword);
            try { await loading.dismiss(); } catch {}
            const ok = await this.modalAlert.create({
              header: 'Exito',
              message: 'La contraseña se actualizo correctamente.',
              buttons: ['OK']
            });
            
            await ok.present();
            return true;
          } catch (e: any) {
            try { await loading.dismiss(); } catch {}
            const msg = e?.message ?? 'Error al cambiar la contraseña.';
            const err = await this.modalAlert.create({
              header: 'Error',
              message: msg,
              buttons: ['OK']
            });
            await err.present();
            return false;
          }
        }
      }
    ]
  });
  await alert.present();
}

  private async eliminarCuenta(password: string) {
    const confirm = await this.modalAlert.create({
      header: 'Eliminando cuenta',
      message: 'Esto puede tardar unos segundos...',
      backdropDismiss: false
    });
    await confirm.present();

    try {
      await this.authService.eliminarCuenta(password);

      try { await confirm.dismiss(); } catch (err) { }
      await this.router.navigate(['/login'], { replaceUrl: true });
    } catch (err: any) {

      try {
        await confirm.dismiss();
      }
      catch (err) { }

      const errAlert = await this.modalAlert.create({
        header: 'Error',
        message: err?.message ?? 'Error al eliminar la cuenta',
        buttons: ['OK']
      });
      await errAlert.present();
      console.error(err);
    }
  }
  async confirmLogout() {
    const alert = await this.modalAlert.create({
      header: 'Cerrar sesion',
      message: 'Esta accion cerrara la sesion de tu cuenta ¿Queres continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesion',
          role: 'destructive',
          handler: () => this.logout()
        }
      ]
    });
    await alert.present();
  }


  private elegir(action: 'logout' | 'delete' | 'edit' | 'cancel') {
    if (action == 'cancel') {
      this.modalCtrl.dismiss(null, 'cancel');
    }
    else {
      this.modalCtrl.dismiss({ action }, 'confirm')
    }
  }




  async cambiarUsuario() {
    const alert = await this.modalAlert.create({
      header: 'Cambiar nombre de usuario',
      inputs: [{ name: 'nombre', type: 'text', placeholder: 'nuevo nombre' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async ({ nombre }) => {
            const nuevo = (nombre ?? '').trim();
            if (!nuevo) return;
            await this.authService.cambiarNombreUsuario(nuevo);
            await this.modalCtrl.dismiss({ nombre: nuevo }, 'confirm');
          }
        }
      ]
    });
    await alert.present();
  }





  async logout() {
    try {
      await this.authService.cerrarSesion();
      await this.modalCtrl.dismiss();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  cerrar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
