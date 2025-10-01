import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioPage } from './usuario.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { UsuarioPageRoutingModule } from './usuario-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    UsuarioPageRoutingModule
  ],
  declarations: [UsuarioPage]
})
export class UsuarioPageModule {}
