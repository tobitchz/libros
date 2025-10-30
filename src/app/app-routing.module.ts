import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { TabsPageModule } from './tabs/tabs.module';

const routes: Routes = [
  {
    path: '',
    // redirectTo: 'tabs',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
     canActivate: [authGuard]
  },

  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },

  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then(m => m.RegistroPageModule)
  },

  {
    path: 'libro/:id',
    loadChildren: () => import('./libro/libro.module').then(m => m.LibroPageModule),
    canActivate: [authGuard]
  },

  {
    path: 'libro',
    loadChildren: () => import('./libro/libro.module').then(m => m.LibroPageModule),
     canActivate: [authGuard]
  },
  {
    path: 'autor/:id',
    loadChildren: () => import('./autor/autor.module').then( m => m.AutorPageModule)
  },

];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
