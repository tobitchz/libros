import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

/**
 * Componente de registro de usuarios.
 * Permite crear una cuenta nueva a través del servicio de autenticación.
 */

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})


export class RegistroPage {

  /** Credenciales ingresadas por el usuario. */
  credentials = { email: '', password: '' };
  /** Mensaje de error mostrado si el registro falla. */
  errorMessage = '';
  /** Controlador del indicador de carga actual. */
  loading: HTMLIonLoadingElement | null = null;


  /**
   * Inyecta los servicios necesarios para autenticación, navegación y carga visual.
   * @param {AuthService} authService - Servicio de autenticación.
   * @param {Router} router - Servicio de enrutamiento para redirigir tras el registro.
   * @param {LoadingController} loadingController - Controlador de carga de Ionic.
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    
  ) {}
 

  /**
   * Registra un nuevo usuario utilizando las credenciales proporcionadas.
   * Muestra un indicador de carga durante el proceso y redirige al login al finalizar.
   */
  async registro() {
    this.loading = await this.loadingController.create({
      message: 'Creando usuario...',
    });
    await this.loading.present();

    try {
      const user = await this.authService.registrarUsuario(
        this.credentials.email,
        this.credentials.password
      );

      if (user) {
        await this.loading.dismiss();
        this.router.navigateByUrl('/login'); // o redirigir a home
      }
    } catch (error: any) {
      console.error('Error en registro:', error.message);
      this.errorMessage = error.message;
      await this.loading.dismiss();
    }
  }
}
