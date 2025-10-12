import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PestaniaConfigPageRoutingModule } from './pestania-config-routing.module';
import { PestaniaConfigPage } from './pestania-config.page';

import {ModalTemaComponent} from './modal-tema/modal-tema.component'

@NgModule({
  declarations: [PestaniaConfigPage, ModalTemaComponent],
  imports: [
    CommonModule,
    IonicModule,
    PestaniaConfigPageRoutingModule,
    
    
  ]
})
export class PestaniaConfigPageModule {}
