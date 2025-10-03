import { Component, OnInit } from '@angular/core';
import { Auth } from '../services/auth';
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
  errorMessage: string = '';
  loading: HTMLIonLoadingElement | null = null;

  constructor(
    private authService: Auth,
    private router: Router,
    private loadingController: LoadingController
  ) { }

  ngOnInit() { }

  /** Autentica las credenciales con el servicio Auth y muestra indicador de carga mientras se procesan */
  async login() {
    this.loading = await this.loadingController.create(
      { message: 'Iniciando sesión...', }
    );
    await this.loading.present();


    const user = await this.authService.registrarUsuario(this.credentials.username,this.credentials.password).catch((error) => {
      console.log(error);
      this.loading?.dismiss()
    })

    if(user){
      this.loading.dismiss()
    }

    this.router.navigateByUrl('/tabs/favoritos');

  }
}
