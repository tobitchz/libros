import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { BuscarPageRoutingModule } from './buscar-routing.module';
import { BuscarPage } from './buscar.page';

@NgModule({
  declarations: [BuscarPage],
  imports: [
    CommonModule,
    IonicModule,
    BuscarPageRoutingModule
  ]
})
export class BuscarPageModule {}
