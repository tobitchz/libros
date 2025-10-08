import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { TabsPageModule } from './tabs/tabs.module';

const routes: Routes = [
  // Ruta raíz: redirige a login al iniciar
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Tabs principal (destacados será la tab inicial)
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  // Login
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  // Registro
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then(m => m.RegistroPageModule)
  },
  // Libro con id
  {
    path: 'libro/:id',
    loadChildren: () => import('./libro/libro.module').then(m => m.LibroPageModule)
  },
  // Libro sin id
  {
    path: 'libro',
    loadChildren: () => import('./libro/libro.module').then(m => m.LibroPageModule)
  },
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
