import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';


/**
 * Componente encargado del inicio de sesión.
 * Muestra el formulario de login y gestiona la autenticación del usuario.
 */

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})


export class LoginPage implements OnInit {
  /** Credenciales ingresadas por el usuario. */
  credentials = { username: '', password: '' };
  /** Mensaje de error mostrado en caso de fallo de autenticación. */
  errorMessage = '';
  /** Referencia al componente de carga mientras se realiza el inicio de sesión. */
  loading: HTMLIonLoadingElement | null = null;


  /**
   * @param authService Servicio de autenticación de Firebase.
   * @param router Controlador de rutas de Angular.
   * @param loadingController Controlador de carga de Ionic.
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController
  ) { }

  /** Inicializa el componente. */
  ngOnInit() { }


  /**
   * Inicia sesión con las credenciales ingresadas.
   * Muestra un loader mientras se procesa y redirige al tab principal si es exitoso.
   */
  async login() {
    this.loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
    });
    await this.loading.present();

    try {
      const user = await this.authService.iniciarSesion(
        this.credentials.username,
        this.credentials.password
      );
      if (user) {
        await this.loading.dismiss();
        this.router.navigateByUrl('/tabs').then(() => {
          const firstInput = document.querySelector('ion-input') as HTMLIonInputElement;
          if (firstInput) {
            firstInput.setFocus();
          }
        });
      }
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Correo o contraseña incorrectos';
      await this.loading.dismiss();
    }
  }
}

