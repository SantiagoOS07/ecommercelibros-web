import { Component, inject} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {DecimalPipe} from '@angular/common';
import { LibrosService } from '../../servicios/libro';
import { LibroResponse } from '../../modelos/libro';

@Component({
  selector: 'app-detalle-libro',
  imports: [DecimalPipe],
  templateUrl: './detalle-libro.html',
  styleUrl: './detalle-libro.css'
})
export class DetalleLibro {
  private librosService = inject(LibrosService);
  private id = inject(ActivatedRoute).snapshot.paramMap.get('id') as string;

  libro = toSignal<LibroResponse | null>(
  this.librosService.consultarPorId(this.id),
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
