import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getDatabase, ref, update, remove } from 'firebase/database';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile, User } from 'firebase/auth';
import { BehaviorSubject, firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    public ngFireAuth: AngularFireAuth,
  ) {
    this.ngFireAuth.onIdTokenChanged(() => {
      this.checkAuthState();
    });
  }


  /**
   * @method checkAuthState
   * @description Verifica el estado de autenticación al inicializar el servicio
   */
  private checkAuthState() {
    this.ngFireAuth.authState.subscribe(user => {
      const isAuth = !!user;
      this.isAuthenticatedSubject.next(isAuth);
    });
  }


  /**
   * @method registrarUsuario
   * @description Registra un nuevo usuario en Firebase Authentication y guarda su email en Realtime Database.
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
   * @method eliminarCuenta()
   * @description elimina la cuenta del usuario actual
   * verifica que haya usuario logeado y que tenga email, reautentica con password e email (eso lo piide FireBase)
   * borra el usuario en realtime DB
   * elimina la cuenta y cierra la sesion
   * @param password password para reautenticar
   */
  async eliminarCuenta(password: string) {
    try {
      const user = await firstValueFrom(this.ngFireAuth.user);
      if (!user) {
        throw new Error("no hay usuario logeado")
      }

      if (!user.email) {
        throw new Error('El usuario no tiene email registrado');
      }

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
   * @method tieneProvider
   * @description Indica si el usuario actual tiene vinculado el provider de email/password
   * esto es para saber si se puede cambiar la contrasenia
   * @return devuelve true si tiene provider y false si no
   */
  async tieneProvider(): Promise<boolean> {
    const user = await this.ngFireAuth.currentUser;
    if (!user) {
      return false;
    }
    return user.providerData.some(p => p?.providerId === 'password');
  }


  /**
   * @method cambiarContrasenia
   * @description Cambia la password del usuario autenticado, 
   * el usuario debe ya haber iniciado con provider,
   * se debe re-autenticar con la password actual
   * y se valida que la nueva password tenga al menos 6 caracteres
   * @param passActual password actual del usuario
   * @param passNueva nueva password a establecer
   */
  async cambiarContrasenia(passActual: string, passNueva: string): Promise<void> {
    const user = await this.ngFireAuth.currentUser;
    if (!user || !user.email) {
      throw new Error("auth/no-current-user");
    }
    const tienePassword = user.providerData.some(p => p?.providerId === 'password');
    if (!tienePassword) {
      throw new Error('auth/no-password-provider');
    }
    if (!passNueva || passNueva.length < 6) {
      throw new Error('auth/weak-password');
    }
    const cred = EmailAuthProvider.credential(user.email, passActual);
    await (user as any).reauthenticateWithCredential(cred);
    await (user as any).updatePassword(passNueva);
  }


  /**
   * @method iniciarSesion
   * @description Inicia sesión con email y contraseña.
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
   * @method resetContraseña
   * @description Envía un correo de restablecimiento de contraseña.
   * @param email Correo del usuario.
   */
  async resetContraseña(email: string) {
    return await this.ngFireAuth.sendPasswordResetEmail(email);
  }


  /**
   * @method cerrarSesion
   * @description Cierra la sesión actual.
   */
  async cerrarSesion() {
    await this.ngFireAuth.signOut();
    this.isAuthenticatedSubject.next(false);
  }


  /**
   * @method getCurrentUserId
   * @description Obtiene el ID del usuario actualmente autenticado
   * @returns ID del usuario o null si no está autenticado
   */
  async getCurrentUserId() {
    const user = await this.ngFireAuth.currentUser;
    return user ? user.uid : null;
  }


  /**
   * @method isLogedIn
   * @description Verifica si el usuario está autenticado (versión síncrona)
   * @returns true si está autenticado, false si no
   */
  async isLoggedIn() {
    const userId = await this.getCurrentUserId()
    return !!userId;
  }


  /**
   * @method obtenerUsuario
   * @description Obtiene el usuario autenticado actualmente.
   */
  async obtenerUsuario() {
    return await this.ngFireAuth.currentUser;
  }


  /**
 * @method refreshUser
 * @description Fuerza la recarga de los datos del usuario autenticado desde Firebase
 * se usa para actualizar el estado local si hubo cambios en displayName, photoURL, etc.
 * @returns el usuario actualizado o null si no hay sesión
 */
  async refreshUser() {
    const user = await this.ngFireAuth.currentUser;
    if (user) {
      await user.reload();
      return await this.ngFireAuth.currentUser;
    }
    return null;
  }


  /**
   * @method cambiarNombreUsuario
   * @description Cambia el nombre de usuario del perfil actual en FireBase y lo actualiza en la realtime DB
   * @param nuevoNombre es el nuevo nombre a asignar
   */
  async cambiarNombreUsuario(nuevoNombre: string) {
    const user = await this.ngFireAuth.currentUser;
    if (!user || !user.uid) throw new Error('no hay usuario logueado');

    await user.updateProfile({ displayName: nuevoNombre });

    const db = getDatabase();
    const reference = ref(db, 'users/' + user.uid);
    await update(reference, { nombre: nuevoNombre });
  }


  /**
   * @method writeEmail
   * @description Escribe el email del usuario en Realtime Database.
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
   * @method writeUserId
   * @description Escribe el ID del usuario en Realtime Database.
   * @param userId ID del usuario.
   */
  writeUserId(userId: any) {
    const db = getDatabase();
    const reference = ref(db, 'users/' + userId);

    update(reference, {
      id: userId
    })
  }


  /**
   * @method subirFotoDePerfil()
   * @description sube la foto de perfil autenticado a cloudinary
   * y actualiza el perfil en Firebase con la nueva url
   * verifica que exista un usuario autenticado, envia la imagen al cloudinary y recibe la url de respuesta
   *  guarda tambienla url en el localStorage 
   * use Cloudinary pq FireBase no permite subir archivos directamente y este me parecia mas comodo
   * @param blob imagen en formato blob
   */
  async subirFotoDePerfil(blob: Blob): Promise<string> {
    const user = await this.ngFireAuth.currentUser;
    if (!user) {
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
    console.log('respuesta', res) // 2
    const data = await res.json();
    console.log('data', data); // 3

    if (!data.secure_url) {
      throw new Error('no se pudo subir la imagen')
    }

    await (user as any).updateProfile({ photoURL: data.secure_url })
    await user.reload();

    const imageUrl: string = String(data.secure_url)
    localStorage.setItem('fotoPerfil', imageUrl)
    return data.secure_url
  }

}
