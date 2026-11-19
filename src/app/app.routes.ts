import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro';
import { Catalogo } from './componentes/catalogo/catalogo';
import { DetalleLibro } from './componentes/detalle-libro/detalle-libro';
import { EditarLibro } from './componentes/editar-libro/editar-libro';
import { Carrito } from './componentes/carrito/carrito';
import { MisCompras } from './componentes/mis-compras/mis-compras';
import { Perfil } from './componentes/perfil/perfil';
import { GestionLibros } from './componentes/gestion-libros/gestion-libros';
import { GestionAutores } from './componentes/gestion-autores/gestion-autores';
import { GestionVentas } from './componentes/gestion-ventas/gestion-ventas';
import { GestionUsuarios } from './componentes/gestion-usuarios/gestion-usuarios';
import { authGuard, guestGuard, rolGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'registro', component: Registro, canActivate: [guestGuard] },
  { path: 'catalogo', component: Catalogo },
  { path: 'catalogo/:id', component: DetalleLibro },
  {
    path: 'catalogo/:id/editar',
    component: EditarLibro,
    canActivate: [rolGuard],
    data: { roles: ['ADMINISTRADOR', 'PROVEEDOR'] }
  },
  { path: 'carrito', component: Carrito, canActivate: [authGuard] },
  { path: 'mis-compras', component: MisCompras, canActivate: [authGuard] },
  { path: 'perfil', component: Perfil, canActivate: [authGuard] },
  {
    path: 'gestion-libros',
    component: GestionLibros,
    canActivate: [rolGuard],
    data: { roles: ['ADMINISTRADOR', 'PROVEEDOR'] }
  },
  {
    path: 'gestion-autores',
    component: GestionAutores,
    canActivate: [rolGuard],
    data: { roles: ['ADMINISTRADOR', 'PROVEEDOR'] }
  },
  {
    path: 'gestion-ventas',
    component: GestionVentas,
    canActivate: [rolGuard],
    data: { roles: ['ADMINISTRADOR', 'PROVEEDOR'] }
  },
  {
    path: 'gestion-usuarios',
    component: GestionUsuarios,
    canActivate: [rolGuard],
    data: { roles: ['ADMINISTRADOR'] }
  },
  { path: '**', pathMatch: 'full', redirectTo: '/' },
];