import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getDatabase, ref, update } from "firebase/database";
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio de autenticación con Firebase.
 * Maneja el registro, inicio y cierre de sesión, y la escritura de datos del usuario.
 */

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  /**
   * @param ngFireAuth Módulo de autenticación de AngularFire.
   */
  constructor(
    public ngFireAuth: AngularFireAuth,
  ) {
    this.ngFireAuth.onIdTokenChanged(() => {
      this.checkAuthState();
    });
  }

  /**
   * Verifica el estado de autenticación al inicializar el servicio
   */
  private checkAuthState() {
    this.ngFireAuth.authState.subscribe(user => {
      const isAuth = !!user;
      this.isAuthenticatedSubject.next(isAuth);
    });
  }

  /**
   * Registra un nuevo usuario en Firebase Authentication y guarda su email en Realtime Database.
   * @param email Correo electrónico del usuario.
   * @param password Contraseña del usuario.
   * @returns Usuario registrado.
   */
  async registrarUsuario(email: string, password: string) {
    const userCredential = await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user?.uid;

    if (uid) {
      const db = getDatabase();
      const reference = ref(db, 'users/' + uid);
      const nombreUsuario = email.split('@')[0];

      await update(reference, {
        id: uid,
        email: email
      });
      this.isAuthenticatedSubject.next(true);
    }

    return userCredential.user;
  }

  /**
   * Inicia sesión con email y contraseña.
   * @param email Correo electrónico.
   * @param password Contraseña.
   * @returns Credenciales del usuario autenticado.
   */
  async iniciarSesion(email: string, password: string) {
    const user = await this.ngFireAuth.signInWithEmailAndPassword(email, password);
    if (user) {
      this.isAuthenticatedSubject.next(true);
    } else {
      this.isAuthenticatedSubject.next(false);
    }
    return user
  }

  /**
   * Envía un correo de restablecimiento de contraseña.
   * @param email Correo del usuario.
   */
  async resetContraseña(email: string) {
    return await this.ngFireAuth.sendPasswordResetEmail(email);
  }

  /** Cierra la sesión actual. */
  async cerrarSesion() {
    await this.ngFireAuth.signOut();
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Obtiene el ID del usuario actualmente autenticado
   * @returns ID del usuario o null si no está autenticado
   */
  async getCurrentUserId() {
    const user = await this.ngFireAuth.currentUser;
    return user ? user.uid : null;
  }

  /**
   * Verifica si el usuario está autenticado (versión síncrona)
   * @returns true si está autenticado, false si no
   */
  async isLoggedIn() {
    const userId = await this.getCurrentUserId()
    return !!userId;
  }

  /** Obtiene el usuario autenticado actualmente. */
  async obtenerUsuario() {
    return await this.ngFireAuth.currentUser;
  }

  async cambiarNombreUsuario(nuevoNombre: string): Promise<void> {
    const user = await this.ngFireAuth.currentUser;
    if (!user || !user.uid) throw new Error('no hay usuario logueado');

    await user.updateProfile({ displayName: nuevoNombre });

    const db = getDatabase();
    const reference = ref(db, 'users/' + user.uid);
    await update(reference, { nombre: nuevoNombre });
  }



  /**
   * Escribe el email del usuario en Realtime Database.
   * @param userId ID del usuario.
   * @param email Correo electrónico del usuario.
   */
  writeEmail(userId: any, email: any) {
    const db = getDatabase();
    const reference = ref(db, 'users/' + userId);

    update(reference, {
      email: email
    })
  }

  /**
   * Escribe el ID del usuario en Realtime Database.
   * @param userId ID del usuario.
   */
  writeUserId(userId: any) {
    const db = getDatabase();
    const reference = ref(db, 'users/' + userId);

    update(reference, {
      id: userId
    })
  }
}
