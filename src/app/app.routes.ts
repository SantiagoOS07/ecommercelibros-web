import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro';
import { Catalogo } from './componentes/catalogo/catalogo';
import { DetalleLibro } from './componentes/detalle-libro/detalle-libro';
import { Carrito } from './componentes/carrito/carrito';
import { MisCompras } from './componentes/mis-compras/mis-compras';
import { Perfil } from './componentes/perfil/perfil';
import { GestionLibros } from './componentes/gestion-libros/gestion-libros';
import { GestionAutores } from './componentes/gestion-autores/gestion-autores';
import { GestionVentas } from './componentes/gestion-ventas/gestion-ventas';
import { GestionUsuarios } from './componentes/gestion-usuarios/gestion-usuarios';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'catalogo', component: Catalogo },
  { path: 'catalogo/:id', component: DetalleLibro },
  { path: 'carrito', component: Carrito },
  { path: 'mis-compras', component: MisCompras },
  { path: 'perfil', component: Perfil },
  { path: 'gestion-libros', component: GestionLibros },
  { path: 'gestion-autores', component: GestionAutores },
  { path: 'gestion-ventas', component: GestionVentas },
  { path: 'gestion-usuarios', component: GestionUsuarios },
  { path: '**', pathMatch: 'full', redirectTo: '/' },
];
