import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
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

  readonly tamanio = 3;
  pagina = signal(0);
  texto = signal('');

  busqueda = toSignal(
    toObservable(this.texto).pipe(
      debounceTime(400),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  private consulta = computed(() => ({
    pagina: this.pagina(),
    palabra: this.busqueda()
  }));

  respuesta = toSignal(
    toObservable(this.consulta).pipe(
      switchMap(c =>
        this.librosService.listar(c.pagina, this.tamanio, c.palabra).pipe(
          catchError(() => {
            this.avisos.error('No pudimos cargar el catálogo. Intenta de nuevo más tarde');
            return of(null);
          })
        )
      )
    )
  );

  cargando = computed(() => this.respuesta() === undefined);
  libros = computed(() => this.respuesta()?.content ?? []);
  totalPaginas = computed(() => this.respuesta()?.totalPages ?? 0);
  total = computed(() => this.respuesta()?.totalElements ?? 0);
  esPrimera = computed(() => this.pagina() === 0);
  esUltima = computed(() => this.pagina() >= this.totalPaginas() - 1);

  escribir(valor: string): void {
    this.texto.set(valor);
    this.pagina.set(0);
  }

  anterior(): void {
    this.pagina.update(p => p - 1);
  }

  siguiente(): void {
    this.pagina.update(p => p + 1);
  }

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
