import { Component, inject } from '@angular/core';
import { NotificacionesService } from '../../servicios/notificaciones';

@Component({
  imports: [],
  selector: 'app-notificaciones',
  styleUrl: './notificaciones.css',
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  servicio = inject(NotificacionesService);
}