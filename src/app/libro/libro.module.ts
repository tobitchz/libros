import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LibroPageRoutingModule } from './libro-routing.module';

import { LibroPage } from './libro.page';

import { HttpClientModule } from '@angular/common/http';
import { ResultadoComponent } from './resultado/resultado.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LibroPageRoutingModule,
    HttpClientModule
  ],
  declarations: [LibroPage, ResultadoComponent]
})
export class LibroPageModule {}
