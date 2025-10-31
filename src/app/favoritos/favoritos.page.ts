import { Component } from '@angular/core';
import { FavoritosService } from '../services/favoritos.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage {

  constructor(
    private router: Router,
    public favService: FavoritosService
  ) { }


  /**
   * @method toggleFavorito
   * @description Alterna el estado de favorito de un libro
   * @param libroId ID de libro a agregar/quitar
   */
  async toggleFavorito(libroId: string): Promise<void> {
    if (!libroId) return;
    try {
      await this.favService.toggleFavorito(libroId);
    } catch (error) {
      console.error('Error al alternar favorito:', error);
    }
  }


  /**
   * @method agregarFavorito
   * @description Agrega un libro a favoritos
   * @param libroId ID de libro a agregar
   */
  async agregarFavorito(libroId: string): Promise<void> {
    try {
      await this.favService.agregarFavorito(libroId);
      console.log(`Libro ${libroId} agregado a favoritos`);
    } catch (error) {
      console.error('Error al agregar favorito:', error);
    }
  }


  /**
   * @method eliminarFavorito
   * @description Elimina un libro de favoritos
   * @param libroId ID de libro a eliminar
   */
  async eliminarFavorito(libroId: string): Promise<void> {
    try {
      await this.favService.eliminarFavorito(libroId);
      console.log(`Libro ${libroId} eliminado de favoritos`);
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
    }
  }


  /**
   * @method recargarFavoritos
   * @description Recarga los favoritos desde la base de datos
   */
  async recargarFavoritos(): Promise<void> {
    try {
      await this.favService.recargarFavoritos();
      console.log('Favoritos recargados');
    } catch (error) {
      console.error('Error al recargar favoritos:', error);
    }
  }


  /**
   * @method limpiarError
   * @description Limpia el mensaje de error
   */
  limpiarError(): void {
    this.favService.mensajeError = '';
  }


  /**
   * @method limpiarTodosFavoritos
   * @description Limpia todos los favoritos
   */
  async limpiarTodosFavoritos(): Promise<void> {
    try {
      await this.favService.limpiarFavoritos();
      console.log('Todos los favoritos eliminados');
    } catch (error) {
      console.error('Error al limpiar favoritos:', error);
    }
  }


  /**
   * @method verDetalle
   * @description Redirige a la vista de detalle del libro seleccionado.
   * @param libroId ID de libro a eliminar
   */
  verDetalle(libroId: any) {
    this.router.navigate(['/libro', { id: libroId, tipo: "works" }]);
  }

}