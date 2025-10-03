import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Proveedor } from '../proveedor';   // importar servicio
import { Router } from '@angular/router';


@Component({
  selector: 'app-destacados',
  templateUrl: 'destacados.page.html',
  styleUrls: ['destacados.page.scss'],
  standalone: false,

})


export class DestacadosPage implements OnInit {

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
