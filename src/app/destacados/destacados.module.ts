import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DestacadosPage } from './destacados.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { DestacadosPageRoutingModule } from './destacados-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    DestacadosPageRoutingModule
  ],
  declarations: [DestacadosPage]
})
export class DestacadosPageModule {}
