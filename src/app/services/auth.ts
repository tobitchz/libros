import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getDatabase, ref, update, get, child } from "firebase/database";

import { AngularFirestore } from '@angular/fire/compat/firestore';


export var currentUserId:any
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(
    public ngFireAuth: AngularFireAuth,
    private firestore: AngularFirestore
  )
     {}

  async registrarUsuario(email: string, password: string) {
    const userCredential = await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user?.uid;

    //if (uid) {
            // Guardar UID 
           // this.writeUserId(uid);
           // currentUserId = uid;
            // guardar resto de datos
          //  this.writeEmail(uid, email);
            
        //  }
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



    async loginUsuario(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

 async iniciarSesion(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  async resetContraseña(email: string) {
    return await this.ngFireAuth.sendPasswordResetEmail(email);
  }

  async cerrarSesion() {
    return await this.ngFireAuth.signOut();
  }

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




  writeEmail(userId:any, email:any){
      const db = getDatabase();
      const reference = ref(db, 'users/' + userId);
  
  
      update(reference, {
        email:email
      })
    }

  writeUserId(userId:any) {
      const db = getDatabase();
      const reference = ref(db, 'users/' + userId);

  update(reference, {
        id: userId
      })
  }
}
