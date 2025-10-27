import { Injectable } from '@angular/core';
import { FirebaseDatabaseService } from './firebase-database.service';
import { Libro } from '../models/libro.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  public favoritos: Libro[] = [];
  public cargando: boolean = false;
  public inicializado: boolean = false;
  mensajeError: string = '';

  constructor(
    private dbService: FirebaseDatabaseService,
    private apiService: ApiService
  ) {
    this.inicializar();
  }

  /**
   * Inicializa el servicio cargando los favoritos
   */
  private async inicializar(): Promise<void> {
    if (this.inicializado) return;

    this.cargando = true;
    this.mensajeError = '';

    try {
      await this.cargarFavoritos();
      this.inicializado = true;
    } catch (error) {
      console.error('Error inicializando favoritos:', error);
      this.mensajeError = 'Error al cargar los favoritos';
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Carga los favoritos desde la base de datos
   */
  private async cargarFavoritos(): Promise<void> {
    try {
      const favoritosIds = await this.obtenerIdsFavoritosDB();

      if (favoritosIds.length > 0) {
        this.favoritos = await this.apiService.getLibros(favoritosIds);
      } else {
        this.favoritos = [];
      }
      this.actualizarLocalStorage();

    } catch (error) {
      console.error('Error cargando favoritos:', error);
      this.favoritos = this.obtenerFavoritosLS();
      throw error;
    }
  }

  /**
   * Obtiene los IDs de favoritos desde la base de datos
   */
  private async obtenerIdsFavoritosDB(): Promise<string[]> {
    try {
      const favData = await this.dbService.getUserData('favoritos');
      return Array.isArray(favData) ? favData : [];
    } catch (error) {
      console.error('Error obteniendo favoritos de la base de datos:', error);
      throw error;
    }
  }

  /**
   * Obtiene favoritos desde localStorage (fallback)
   */
  private obtenerFavoritosLS(): Libro[] {
    try {
      const librosGuardados = localStorage.getItem('libros_favoritos');
      if (librosGuardados) {
        const librosData = JSON.parse(librosGuardados);
        return librosData.map((libroData: any) => new Libro(libroData));
      }
    } catch (error) {
      console.error('Error obteniendo favoritos de localStorage:', error);
    }
    return [];
  }

  /**
   * Actualiza localStorage con los favoritos actuales
   */
  private actualizarLocalStorage(): void {
    try {
      localStorage.setItem('libros_favoritos', JSON.stringify(this.favoritos));
    } catch (error) {
      console.error('Error actualizando localStorage:', error);
    }
  }

  /**
   * Obtiene todos los libros favoritos
   */
  obtenerFavoritos(): Libro[] {
    return [...this.favoritos];
  }

  /**
   * Obtiene un libro favorito específico
   */
  obtenerFavorito(libroId: string): Libro | null {
    return this.favoritos.find(libro => libro.id === libroId) || null;
  }

  /**
   * Agrega un libro a favoritos
   */
  async agregarFavorito(libroId: string): Promise<void> {
    if (this.esFavorito(libroId)) {
      return;
    }
    this.mensajeError = '';

    try {
      const libro = await this.apiService.getLibro(libroId);
      if (!libro) {
        throw new Error('Libro no encontrado');
      }

      const nuevosIds = [...(await this.obtenerIdsFavoritosDB()), libroId];
      await this.dbService.setUserData(nuevosIds, 'favoritos');

      this.favoritos.push(libro);
      this.actualizarLocalStorage();

    } catch (error) {
      console.error('Error agregando favorito:', error);
      this.mensajeError = 'Error al agregar a favoritos';
      throw error;
    }
  }

  /**
   * Elimina un libro de favoritos
   */
  async eliminarFavorito(libroId: string): Promise<void> {
    if (!this.esFavorito(libroId)) {
      return;
    }
    this.mensajeError = '';

    try {
      const nuevosIds = (await this.obtenerIdsFavoritosDB()).filter(id => id !== libroId);
      await this.dbService.setUserData(nuevosIds, 'favoritos');

      this.favoritos = this.favoritos.filter(libro => libro.id !== libroId);
      this.actualizarLocalStorage();

    } catch (error) {
      console.error('Error eliminando favorito:', error);
      this.mensajeError = 'Error al eliminar de favoritos';
      throw error;
    }
  }

  /**
   * Alterna el estado de favorito de un libro
   */
  async toggleFavorito(libroId: string): Promise<void> {
    if (this.esFavorito(libroId)) {
      await this.eliminarFavorito(libroId);
    } else {
      await this.agregarFavorito(libroId);
    }
  }

  /**
   * Verifica si un libro es favorito
   */
  esFavorito(libroId: string): boolean {
    return this.favoritos.some(libro => libro.id === libroId);
  }

  /**
   * Elimina todos los favoritos
   */
  async limpiarFavoritos(): Promise<void> {
    this.mensajeError = '';

    try {
      await this.dbService.deleteUserData('favoritos');
      this.favoritos = [];
      this.actualizarLocalStorage();
    } catch (error) {
      console.error('Error limpiando favoritos:', error);
      this.mensajeError = 'Error al limpiar favoritos';
      throw error;
    }
  }

  /**
   * Recarga los favoritos desde la base de datos
   */
  async recargarFavoritos(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';

    try {
      await this.cargarFavoritos();
    } catch (error) {
      console.error('Error recargando favoritos:', error);
      this.mensajeError = 'Error al recargar favoritos';
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Estado de carga
   */
  estaCargando(): boolean {
    return this.cargando;
  }
}