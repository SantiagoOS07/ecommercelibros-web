import { Component, inject} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { LibrosService } from '../../servicios/libro';
import { LibroResponse } from '../../modelos/libro';

@Component({
  selector: 'app-detalle-libro',
  imports: [],
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
}
