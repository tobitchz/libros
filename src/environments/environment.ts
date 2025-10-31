
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";

import { Router } from "@angular/router";
import { Injectable } from "@angular/core";



export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyDGEgL0sfEiD2qWdMp_7S_pNFQwz4imjK0",
    authDomain: "libros-c829a.firebaseapp.com",
    databaseURL: "https://libros-c829a-default-rtdb.firebaseio.com",
    projectId: "libros-c829a",
    storageBucket: "libros-c829a.firebasestorage.app",
    messagingSenderId: "658724758743",
    appId: "1:658724758743:web:b4a63dfb9fd9fc4f6d7c92",
    measurementId: "G-WEFDKHY2HR"
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.


const app = initializeApp(environment.firebaseConfig);

const auth = getAuth();

export var currentUserId:any

@Injectable({
  providedIn:'root'
})


export class ControladorR {
  constructor(private ruta:Router){}
}

