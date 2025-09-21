import { Component } from '@angular/core';
import { Proveedor } from '../proveedor';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {


  
    constructor(public proveedor: Proveedor) 
    {
      
    }
  
    ngOnInit() {
    
    }
  
  
    

}
