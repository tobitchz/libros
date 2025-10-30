import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ModalTemaComponent } from './modal-tema/modal-tema.component';
import { Router } from '@angular/router';
import { AuthService } from '.././services/auth';
import { ThemeService, ThemePref } from '../services/theme';
import { Subscription } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-pestania-config',
  templateUrl: './pestania-config.page.html',
  styleUrls: ['./pestania-config.page.scss'],
  standalone: false
})
export class PestaniaConfigPage implements OnInit, OnDestroy {

  /** 
   * es el nombre visible del usuario en esta pestania*/
  nombreUsuario: string = '';

  /**el email del usuario, si no esta logeado se muestra un string vacio */
  email: string = '';

  /** url de la foto */
  fotoUrl: string | null = null;


  /**guarda temporalmente el nuevo nombre de usuario mientras el usuario lo edita */
  nombreEd = '';

  /**flag que indica si se esta guardando el nuevo nombre
   * 
   * 
   */
  guardandoNombre = false;


  /** se usar para guardar la suscripcion al stream de auth ($user)
   * Esto permite que la app se entere de inmediato si el usuario inicia sesion o la cierra
   * 
   * 
   * se borra en ngOnDestroy*/
  private sub?: Subscription;


  constructor(private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private router: Router,
    private authService: AuthService,
    public theme: ThemeService
  ) { }


  /**
   * @method ngOnInit()
   * 
   * se ejecuta cuando se crea el componente
   * HACE 2 COSAS:
   * 
   *        1) llama al metodo cargarUsuario() para mostrar la informacion actual del usuario
   *        2) se suscribe al observable user$, lo tuve que hacer porque no se actualizaban los datos automaticamente 
   * 
   * gracias a esta funcion la interfaz se actualiza al toque sin necesidad de cargar la pagina 
   */




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


  /**
   * @method ionWillEnter()
   * 
   * 
   * este metodo pertenece al ciclo de vida de ionic, es para manterner actualizados los datos
   * 
   * se ejecuta cada vez que el usuario vuelve a entrar a esta pestania
   * 
   * esta funcion vuelve a llamar a cargarUsuario() para asegurarse que los datos mostrados esten actualizados
   * 
   * invoca el @method de refreshUser() del AuthService para forzar una actualizacion
   * de la informacion del usuario pero desde FireBase (por si hubo algun cambio en el servidor)
   * 
   * 
   * 
   */

  async ionWillEnter() {
    await this.cargarUsuario();
    await this.authService.refreshUser();

  }

  /**
   * 
   * @method ngOnDestroy()
   * 
   * 
   * este metodo se ejecuta automaticamente cuando el componente se destruye o sale de la vista
   * 
   * lo uso principalmente para cancelar la suscripcion del user$
   * 
   */

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }


  /**
   * 
   * @method openTemaModal() 
   * 
   * este metodo abre el modal de la seleccion del tema, donde se puede elegir entre 'oscuro', 'claro' y 'sistema'
   * 
   * funciona asi:
   * 
   *        1) crea y muestra un modal utilizando el ModalTemaComponent
   *        2) espera a que el usuario lo cierre 
   *        3) si cierra con 'confirmar', agarra la opcion elegida y la aplica mediante ThemeService
   * 
   * 
   * ThemeService guarda las preferencias en el localStorage y cambia las variables de color globales para modificar
   * el tema en toda la app  
   *          
   * 
   * 
   */

  async openTemaModal() {

    const temaModal = await this.modalCtrl.create({
      component: ModalTemaComponent, // cree una pestania para este modal
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





  /**
   * 
   * @method cargarUsuario()
   * 
   * 
   * este metodo agarra la informacion del usuario actualmente autenticado en FireBase
   * 
   * 
   * 
   * llama al AuthService para obtener el usuario activo
   * 
   * recarga la info con user.reload(), para q los datos sean los mas recientes
   * 
   * extrae su nombre, correo y foto de perfil para mostrarlos en pantalla
   * 
   * 
   * 
   * 
   * 
   */

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

  /**
   * 
   * @method cambiarUsuarioInline()
   * 
   * abre un prompt para cargar el nombre de usuario
   * 
   * tambien valida la longitud maxima y si esta vacio
   * 
   * actualiza nombreUsuario y nombreEd para tener un feedback inmediato
   * 
   * 
   * 
   */


  async cambiarUsuarioInline() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar nombre de usuario',
      inputs: [{ name: 'nombre', type: 'text', placeholder: 'Nuevo nombre', value: this.nombreUsuario }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async ({ nombre }) => {
            const nuevo = (nombre ?? '').trim();
            if (!nuevo) {
              return false;
            }
            if (nuevo.length > 16) {
              const err = await this.alertCtrl.create({
                header: 'Error',
                message: 'El nombre no puede tener más de 16 caracteres.',
                buttons: ['OK']
              });
              await err.present();
              return false;
            }
            await this.authService.cambiarNombreUsuario(nuevo);
            this.nombreUsuario = nuevo;
            this.nombreEd = nuevo;
            return true;
          }
        }
      ]
    });
    await alert.present();
  }



  /** 
   * @method cambiarPasswordInline()
   * 
   * 
   * este abre un prompt para cambiar la password (pide la password actual, nueva y confirmacion de la nueva)
   * 
   * valida que los campos esten completos, la longitud minima y que coincidan
   * 
   */

  async cambiarPasswordInline() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar contraseña',
      inputs: [
        { name: 'actual', type: 'password', placeholder: 'Contraseña actual' },
        { name: 'passwordNueva', type: 'password', placeholder: 'Nueva contraseña' },
        { name: 'passwordRepetida', type: 'password', placeholder: 'Repetí contraseña' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cambiar',
          handler: async (data) => {
            const actual = (data?.actual ?? '').trim();
            const nueva = (data?.passwordNueva ?? '').trim();
            const repetida = (data?.passwordRepetida ?? '').trim();
            if (!actual || !nueva || !repetida) {
              await this.errorAlert('Completá todos los campos.'); return false;
            }
            if (nueva.length < 6) {
              await this.errorAlert('La nueva contraseña debe tener al menos 6 caracteres.'); return false;
            }
            if (nueva !== repetida) {
              await this.errorAlert('Las contraseñas no coinciden.'); return false;
            }

            try {
              await this.authService.cambiarContrasenia(actual, nueva);
              await this.okAlert('Contraseña actualizada.');
              return true;
            } catch (e: any) {
              await this.errorAlert(e?.message ?? 'Error al cambiar la contraseña.');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }


  /**
   * 
   * @method cambiarFotoInline()
   * 
   * abre el selector del dispositivo y permite elegir entre camara y galeria, sube la foto y la actualiza  
   * 
   * 
   * 
   * usa el Capacitor Camera 
   * 
   * actualiza fotoUrl para tener feedback instantaneo
   */

  async cambiarFotoInline() {
    try {
      const imagen = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt //esto es para que el usuario elija de donde sacar la foto
      });
      if (!imagen.webPath) {
        return;

      }

      const res = await fetch(imagen.webPath);
      const blob = await res.blob();
      const url = await this.authService.subirFotoDePerfil(blob);
      this.fotoUrl = url;
    } catch (e: any) {
      await this.errorAlert('No se pudo cambiar la foto.');
    }
  }


  /**
   * 
   * @method confirmarLogoutInline()
   * 
   * muestra confirmacion para cerrar sesion 
   * 
   */

  async confirmarLogoutInline() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Querés continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar sesión', role: 'destructive', handler: () => this.logoutInline() }
      ]
    });
    await alert.present();
  }

  /**
   * @method logoutInline()
   * 
   * ejectua el logout y te lleva al login
   * 
   */

  async logoutInline() {
    try {
      await this.authService.cerrarSesion();
      this.router.navigate(['/login']);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 
   * @function confirmarEliminarCuentaInline()
   * 
   * muestra una alerta de confirmacion para eliminar la cuenta y llama a la funcion @see pedirPasswordEliminar()
   * 
   * 
   */

  async confirmarEliminarCuentaInline() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cuenta',
      message: 'Esta acción es irreversible. ¿Querés continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.pedirPasswordEliminar() }
      ]
    });
    await alert.present();
  }

  /** 
   * 
   * 
   * @method pedirPasswordEliminar()
   * 
   * 
   * pide la password del usuario para poder eliminar la cuenta 
  */

  private async pedirPasswordEliminar() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar contraseña',
      inputs: [{ name: 'password', type: 'password', placeholder: 'Contraseña' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async ({ password }) => {
            const pw = (password ?? '').trim();
            if (!pw) {
              return false;
            }
            return await this.eliminarCuentaInline(pw);
          }
        }
      ]
    });
    await alert.present();
  }


  /**
   * 
   * @method eliminarCuentaInline()
   * 
   * 
   * elimina la cuenta del usuario tras reautenticar, limpia el estado y te lleva a login
   * 
   * @param password es la password actual del usuario par apoder reautenticar
   * 
   * tambien muestra un 'esperando' mientras corre el proceso, pq puede tardar un cachito hasta que se borre
   * 
   */

  private async eliminarCuentaInline(password: string) {
    const waiting = await this.alertCtrl.create({
      header: 'Eliminando cuenta',
      message: 'Un momento...',
      backdropDismiss: false
    });
    await waiting.present();

    try {
      await this.authService.eliminarCuenta(password);
      try { await waiting.dismiss(); } catch { }
      this.router.navigate(['/login'], { replaceUrl: true });
      return true;
    } catch (err: any) {
      try { await waiting.dismiss(); } catch { }
      await this.errorAlert(err?.message ?? 'Error al eliminar la cuenta');
      return false;
    }
  }


  /**
   * @method okAlert()
   * muestra un alerta de exito
   *  
   */

  private async okAlert(msg: string) {
    const a = await this.alertCtrl.create({
      header: 'Listo',
      message: msg, buttons: ['OK']
    });
    await a.present();
  }

  /**
   * @method errorAlert()
   * 
   */
  private async errorAlert(msg: string) {
    const a = await this.alertCtrl.create({
      header: 'Error',
      message: msg, buttons: ['OK']
    });
    await a.present();
  }

  /**
   * 
   * estas dos las hice para reutilizar codigo
   */
}
