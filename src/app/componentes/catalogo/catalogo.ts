import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { LibrosService } from '../../servicios/libro';
import { NotificacionesService } from '../../servicios/notificaciones';

@Component({
  imports: [RouterLink, DecimalPipe],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo {
  private librosService = inject(LibrosService);
  private avisos = inject(NotificacionesService);

  libros = toSignal(
    this.librosService.listar().pipe(
      map(pagina => pagina.content),
      catchError(() => {
        this.avisos.error('Ocurrió un error. Intenta de nuevo más tarde');
        return of([]);
      })
    )
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