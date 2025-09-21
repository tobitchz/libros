import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Proveedor } from '../proveedor';   // importar servicio
import { Router } from '@angular/router';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,

})


export class Tab1Page implements OnInit {

  libros: any[] = [];

  constructor(
    private alertController: AlertController,
    private proveedor: Proveedor   ,// meter servicio
    private router: Router 
  ) {}


  ngOnInit() {
    // cargar libros destacados al iniciar
    this.proveedor.librosDestacados().subscribe(data => {
      this.libros = data;
      console.log('Libros destacados:', this.libros);
    });
  }



  verDetalle(libro: any) {
    // cada libro tiene un id
    this.router.navigate(['/libro', { id: libro.id, tipo: libro.tipo }]);
  }
}
