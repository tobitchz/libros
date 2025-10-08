import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})


export class RegistroPage {
  credentials = { email: '', password: '' };
  errorMessage = '';
  loading: HTMLIonLoadingElement | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    
  ) {}

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
