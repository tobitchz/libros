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
    private router: Router) {}

  async ngOnInit() {

  }

 async confirmDelete(){
    const alert = await this.modalAlert.create({
      header: 'Eliminar cuenta',
      message: 'Esto borrara tu cuenta, esta accion es irreversible ¿Queres continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.elegir('delete')
        }
      ]
    });
    await alert.present();
  }

   async confirmLogout(){
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


  private elegir(action: 'logout' | 'delete' | 'edit' | 'cancel'){
    if(action == 'cancel'){
      this.modalCtrl.dismiss(null, 'cancel');
    }  
    else{
      this.modalCtrl.dismiss({action}, 'confirm')
    }
  }




  async cambiarUsuario() {
  const alert = await this.modalAlert.create({
    header: 'Cambiar nombre de usuario' ,
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
