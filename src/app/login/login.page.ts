import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  credentials = { username: '', password: '' };
  errorMessage = '';
  loading: HTMLIonLoadingElement | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

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
    firstInput.setFocus(); // método propio de ion-input
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

