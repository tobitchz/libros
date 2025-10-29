import { Component } from '@angular/core';
import { FavoritosService } from '../services/favoritos.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage {

  constructor(
    public favService: FavoritosService
  ) { }

  /**
   * Alterna el estado de favorito de un libro
   */
  async toggleFavorito(libroId: string): Promise<void> {
    try {
      await this.favService.toggleFavorito(libroId);
    } catch (error) {
      console.error('Error al alternar favorito:', error);
    }
  }

  /**
   * Agrega un libro a favoritos
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
   * Elimina un libro de favoritos
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
   * (de prueba) Verifica si un libro es favorito
   */
  async esFavorito(libroId: string): Promise<void> {
    const esFav = this.favService.esFavorito(libroId);
    console.log(`¿El libro ${libroId} es favorito?`, esFav);

    if (esFav) {
      this.mostrarMensaje('El libro está en favoritos');
    } else {
      this.mostrarMensaje('El libro NO está en favoritos');
    }
  }

  /**
   * Recarga los favoritos desde la base de datos
   */
  async recargarFavoritos(): Promise<void> {
    try {
      await this.favService.recargarFavoritos();
      console.log('Favoritos recargados');
      this.mostrarMensaje('Favoritos actualizados');
    } catch (error) {
      console.error('Error al recargar favoritos:', error);
    }
  }

  /**
   * Limpia el mensaje de error
   */
  limpiarError(): void {
    this.favService.mensajeError = '';
  }

  /**
   * Limpia todos los favoritos
   */
  async limpiarTodosFavoritos(): Promise<void> {
    try {
      await this.favService.limpiarFavoritos();
      console.log('Todos los favoritos eliminados');
      this.mostrarMensaje('Favoritos eliminados');
    } catch (error) {
      console.error('Error al limpiar favoritos:', error);
    }
  }

  /**
   * (de prueba) Muestra un mensaje temporal (puedes implementar toast)
   */
  private mostrarMensaje(mensaje: string): void {
    // Aquí puedes implementar un toast service
    console.log('Mensaje:', mensaje);
    // Ejemplo con alerta básica:
    // alert(mensaje);
  }
}