import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getDatabase, ref, update, get, child, remove } from "firebase/database";

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, throwError } from 'rxjs';
import { EmailAuthProvider } from 'firebase/auth';

/** Identificador del usuario actualmente autenticado. */
export var currentUserId: any

/**
 * Servicio de autenticación con Firebase.
 * Maneja el registro, inicio y cierre de sesión, y la escritura de datos del usuario.
 */


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  /**
   * @param ngFireAuth Módulo de autenticación de AngularFire.
   * @param firestore Referencia al servicio de base de datos Firestore.
   */
  constructor(
    public ngFireAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }

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
    }

    return userCredential.user;
  }

  async eliminarCuenta(password: string) {

    try {
      const user = await firstValueFrom(this.ngFireAuth.user);
      if (!user) {
        throw new Error("no hay usuario logeado")
      }

      if (!user.email) {
        throw new Error('El usuario no tiene email registrado');
      } // esto valida y avisa que el strin no es null

      const credential = EmailAuthProvider.credential(user.email, password);

      await (user as any).reauthenticateWithCredential(credential)

      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      await remove(userRef)



      await user.delete();

      await this.ngFireAuth.signOut();

      console.log('usuario eliminado correctamente');
      return true;
    } catch (err: any) {
      console.error("error al eliminar la cuenta:", err);

      throw err;
    }
  }


  /**
   * Inicia sesión con email y contraseña.
   * @param email Correo electrónico.
   * @param password Contraseña.
   * @returns Credenciales del usuario autenticado.
   */
  async loginUsuario(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  /**
   * Alias de loginUsuario. Inicia sesión del usuario.
   */
  async iniciarSesion(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);
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
    return await this.ngFireAuth.signOut();
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
