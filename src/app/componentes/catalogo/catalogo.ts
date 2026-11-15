import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { LibrosService } from '../../servicios/libro';
import { LibroDetalleResponse } from '../../modelos/libro';

@Component({
  imports: [RouterLink, DecimalPipe],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo {
  private librosService = inject(LibrosService);

  libros =toSignal(
    this.librosService.listar().pipe(map(pagina => pagina.content)),
    { initialValue: [] as LibroDetalleResponse[]}
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