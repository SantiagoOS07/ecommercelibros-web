import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { LibrosService } from '../../servicios/libro';
import { NotificacionesService } from '../../servicios/notificaciones';
import { LibroResponse } from '../../modelos/libro';

@Component({
  selector: 'app-detalle-libro',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './detalle-libro.html',
  styleUrl: './detalle-libro.css'
})
export class DetalleLibro {
  private librosService = inject(LibrosService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private id = inject(ActivatedRoute).snapshot.paramMap.get('id') as string;

  libro = toSignal<LibroResponse | null>(
    this.librosService.consultarPorId(this.id).pipe(
      catchError(() => {
        this.avisos.error('Error: no se encontró el libro');
        this.router.navigate(['/catalogo']);
        return of(null);
      })
    ),
    { initialValue: null }
  );

  badgeEstado(estado: string): string {
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-success';
      case 'AGOTADO':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }
}