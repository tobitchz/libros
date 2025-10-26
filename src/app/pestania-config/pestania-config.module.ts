import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { PestaniaConfigPage } from './pestania-config.page';
import { ModalTemaComponent } from './modal-tema/modal-tema.component';
import { ModalCuentaComponent } from './modal-cuenta/modal-cuenta.component';

@NgModule({
  declarations: [
    PestaniaConfigPage,
    ModalTemaComponent,
    ModalCuentaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      { path: '', component: PestaniaConfigPage }
    ])
  ]
})
export class PestaniaConfigModule {}
