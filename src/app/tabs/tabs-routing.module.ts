import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../auth/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'destacados',
        loadChildren: () => import('../destacados/destacados.module').then(m => m.DestacadosPageModule)
      },
      {
        path: 'buscar',
        loadChildren: () => import('../buscar/buscar.module').then(m => m.BuscarPageModule)
      },
      {
        path: 'config',
        loadChildren: () => import('../pestania-config/pestania-config.module').then(m => m.PestaniaConfigPageModule)
      },
      {
        path: 'favoritos',
        loadChildren: () => import('../favoritos/favoritos.module').then(m => m.FavoritosPageModule)
      },
      {
        path: '',
        redirectTo: 'destacados',
        pathMatch: 'full'
      }
    ]
  },
  //{
    //path: '',
    //redirectTo: 'destacados',
   // pathMatch: 'full'
  //}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
