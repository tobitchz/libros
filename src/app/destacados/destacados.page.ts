import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Proveedor } from '../proveedor';   
import { Router } from '@angular/router';
import { FavoritosService } from '../services/favoritos.service';


/**
 * Componente que muestra los libros destacados obtenidos desde el servicio `Proveedor`.
 * Permite acceder al detalle de cada libro.
 */


@Component({
  selector: 'app-destacados',
  templateUrl: 'destacados.page.html',
  styleUrls: ['destacados.page.scss'],
  standalone: false,

})


export class DestacadosPage implements OnInit {

  /** Lista de libros destacados obtenidos desde la API. */
  libros: any[] = [];

  /**
   * Inyecta los servicios necesarios para mostrar alertas, obtener datos y navegar entre vistas.
   * @param {AlertController} alertController - Controlador de alertas de Ionic.
   * @param {Proveedor} proveedor - Servicio que proporciona los datos de libros.
   * @param {Router} router - Servicio de enrutamiento para cambiar de vista.
   */
  constructor(
    private alertController: AlertController,
    private proveedor: Proveedor   ,// meter servicio
    private router: Router ,
    public favService: FavoritosService
  ) {}


  /**
   * Carga los libros destacados al inicializar el componente.
   */
  ngOnInit() {
    // cargar libros destacados al iniciar
    this.proveedor.librosDestacados().subscribe(data => {
      this.libros = data;
    });
  }


/**
   * Redirige a la vista de detalle del libro seleccionado.
   * @param {any} libro - Objeto que contiene los datos del libro seleccionado.
   */
  verDetalle(libro: any) {
  
    this.router.navigate(['/libro', { id: libro.id, tipo: libro.tipo }]);
  }

    /**
   * Alterna el estado de favorito de un libro
   * @param {string} libroId -id o key del libro
   */
  async toggleFavorito(libroId: string | null): Promise<void> {
    if (!libroId) return;
    try {
      await this.favService.toggleFavorito(libroId);
    } catch (error) {
      console.error('Error al alternar favorito:', error);
    }
  }

  /**
   * Verifica si el libro actual está en favoritos
   * * @param {string} libroId -id o key del libro
   */
  esFavorito(libroId: string | null) {
    return libroId ? this.favService.esFavorito(libroId) : false;
  }

}
