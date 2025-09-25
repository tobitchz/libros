import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PestaniaConfigPageRoutingModule } from './pestania-config-routing.module';
import { PestaniaConfigPage } from './pestania-config.page';

@NgModule({
  declarations: [PestaniaConfigPage],
  imports: [
    CommonModule,
    IonicModule,
    PestaniaConfigPageRoutingModule
  ]
})
export class PestaniaConfigPageModule {}
