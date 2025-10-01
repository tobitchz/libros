import { Component } from '@angular/core';
import { Proveedor } from '../proveedor';

@Component({
  selector: 'app-usuario',
  templateUrl: 'usuario.page.html',
  styleUrls: ['usuario.page.scss'],
  standalone: false,
})
export class UsuarioPage {


  
    constructor(public proveedor: Proveedor) 
    {
      
    }
  
    ngOnInit() {
    
    }
  
  
    

}
