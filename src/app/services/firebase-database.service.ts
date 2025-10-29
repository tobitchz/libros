import { Injectable } from '@angular/core';
import { getDatabase, ref, get, update, set, remove } from "firebase/database";
import { AuthService } from './auth';

/**
 * Servicio que realiza operaciones con Firebase Realtime Database.
 * Siempre autentifica al usuario antes de operar.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseDatabaseService {
  private db = getDatabase();

  constructor(
    private authService: AuthService
  ) { }

  /**
   * Obtiene la referencia a la ruta del usuario actual
   * @param path Ruta adicional dentro del nodo del usuario (opcional)
   * @returns Referencia a la base de datos
   */
  async getUserRef(path: string = ''): Promise<any> {
    const user = await this.authService.obtenerUsuario();
    if (!user || !user.uid) {
      throw new Error('Usuario no autenticado');
    }
    const fullPath = path ? `users/${user.uid}/${path}` : `users/${user.uid}`;
    return ref(this.db, fullPath);
  }

  /**
   * Obtiene un campo específico del usuario actual
   * @param path Campo a obtener (ej: 'email', 'favoritos')
   * @returns Promesa con el valor del campo
   */
  async getUserData(path: string = ''): Promise<any> {
    if (!this.authService.isLoggedIn()) {
      throw new Error('Usuario no autenticado');
    }
    try {
      const pathRef = path ? await this.getUserRef(path) : await this.getUserRef();
      const snapshot = await get(pathRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Error al obtener campo ${path}:`, error);
      throw error;
    }
  }

  /**
   * Agrega datos al usuario actual
   * @param data datos a agregar
   */
  async updateUserData(data: any, path: string = ""): Promise<void> {
    try {
      const userRef = path ? await this.getUserRef(path) : await this.getUserRef();
      await update(userRef, data);
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      throw error;
    }
  }

  /**
   * Elimina datos en una ruta específica del usuario actual
   * @param path Ruta a eliminar (ej: 'favoritos/0')
   */
  async deleteUserData(path: string = ""): Promise<void> {
    try {
      const userRef = path ? await this.getUserRef(path) : await this.getUserRef();
      await remove(userRef);
    } catch (error) {
      console.error('Error al eliminar datos del usuario:', error);
      throw error;
    }
  }

  /**
   * Establece/sobrescribe datos de una ruta específica
   * @param data Datos a establecer
   * @param path Ruta donde establecer los datos
   */
  async setUserData(data: any, path: string = ""): Promise<void> {
    try {
      const userRef = path ? await this.getUserRef(path) : await this.getUserRef();
      await set(userRef, data);
    } catch (error) {
      console.error('Error al establecer datos del usuario:', error);
      throw error;
    }
  }

  // /**
  //  * Actualiza el email del usuario actual
  //  * @param email Nuevo email
  //  * @returns Promesa de la operación
  //  */
  // async updateEmail(email: string): Promise<void> {
  //   try {
  //     return await this.updateUserData({ email });
  //   } catch (error) {
  //     console.error('Error al actualizar email:', error);
  //     throw error;
  //   }
  // }

  /**
   * Establece datos iniciales para un nuevo usuario
   * @param userId ID del usuario
   * @param email Email del usuario
   */
  async setInitialUserData(userId: string, email: string) {
    try {
      const userRef = ref(this.db, `users/${userId}`);
      await set(userRef, {
        id: userId,
        email: email,
        favoritos: []
      });
    } catch (error) {
      console.error('Error al establecer datos iniciales:', error);
      throw error;
    }
  }
}
