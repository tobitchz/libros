import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { getDatabase, ref, update, get, child, remove } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";


import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, throwError } from 'rxjs';
import { EmailAuthProvider } from 'firebase/auth';
import { updatePassword, reauthenticateWithCredential } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';






/** Identificador del usuario actualmente autenticado. */
export var currentUserId: any


/**
 * Servicio de autenticación con Firebase.
 * Maneja el registro, inicio y cierre de sesión, y la escritura de datos del usuario.
 */

@Injectable({
  providedIn: 'root',
  
})


export class AuthService {
  
  public readonly user$!: Observable<any>;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();
  

  /**
   * @param ngFireAuth Módulo de autenticación de AngularFire.
   */
  constructor(
    public ngFireAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.user$ = this.ngFireAuth.authState.pipe(distinctUntilChanged());
    this.ngFireAuth.onIdTokenChanged(() => {
      this.checkAuthState();
    })
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


  async eliminarCuenta(password: string) {

    try {
      const user = await firstValueFrom(this.ngFireAuth.user);
      if (!user) {
        throw new Error("no hay usuario logeado")
      }

      if (!user.email) {
        throw new Error('El usuario no tiene email registrado');
      } // esto valida y avisa que el strin no es nulll

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


  async tieneProvider(): Promise<boolean> {
    const user = await this.ngFireAuth.currentUser;
    if (!user) {
      return false;
    }
    return user.providerData.some(p => p?.providerId === 'password');
  }


  async cambiarContrasenia(passActual: string, passNueva: string): Promise<void> {
    const user = await this.ngFireAuth.currentUser;


    if (!user || !user.email) {
      throw new Error("auth/no-current-user");
    }


    const tienePassword = user.providerData.some(p => p?.providerId === 'password');


    if (!tienePassword) {
      throw new Error('auth/no-password-provider');
    }


    if (!passNueva || passNueva.length < 8) {
      throw new Error('auth/weak-password');
    }



    const cred = EmailAuthProvider.credential(user.email, passActual);


    await (user as any).reauthenticateWithCredential(cred);
    await (user as any).updatePassword(passNueva);
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
    const user = await this.ngFireAuth.signInWithEmailAndPassword(email, password);
    if (user) {
      console.log(user);
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


    await user.reload();



    const db = getDatabase();
    const reference = ref(db, 'users/' + user.uid);
    await update(reference, { nombre: nuevoNombre });
  }

  async refreshUser() {
    const u = await this.ngFireAuth.currentUser;
    await u?.reload();
    return this.ngFireAuth.currentUser;
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

  async subirFotoDePerfil(blob: Blob) : Promise<string> {

    const user = await this.ngFireAuth.currentUser;

    if(!user){

      throw new Error('no hay usuario logeado')
    }

    const formData = new FormData();
    
    formData.append('file', blob);
    formData.append('upload_preset', 'librosApp')
    formData.append('cloud_name', 'dk5cbavtn')

    
    console.log("subiendo imagen") // 1
    const res = await fetch(`https://api.cloudinary.com/v1_1/dk5cbavtn/image/upload`, {
      method: 'POST',
      body: formData
    })

    console.log('respuesta',res) // 2

    const data = await res.json();
    console.log('data', data); // 3



    if(!data.secure_url){
      throw new Error('no se pudo subir la imagen')
    }

    await (user as any).updateProfile({photoURL : data.secure_url})
    await user.reload();

    const imageUrl: string = String(data.secure_url)
    localStorage.setItem('fotoPerfil', imageUrl)

    return data.secure_url


  }


  


}
