import { Component } from '@angular/core';
import { Proveedor } from '../proveedor';

@Component({
  selector: 'app-favoritos',
  templateUrl: 'favoritos.page.html',
  styleUrls: ['favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage {


  
    constructor(public proveedor: Proveedor) 
    {
      
    }
  
    ngOnInit() {
    
    }
  
  
    

}
