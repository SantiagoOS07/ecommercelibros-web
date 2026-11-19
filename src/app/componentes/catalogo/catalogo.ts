import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { LibrosService } from '../../servicios/libro';
import { CarritosService } from '../../servicios/carritos';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { LibroDetalleResponse } from '../../modelos/libro';

@Component({
  imports: [RouterLink, DecimalPipe],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo {
  private librosService = inject(LibrosService);
  private carritosService = inject(CarritosService);
  private authService = inject(AuthService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly tamanio = 9;
  pagina = signal(0);
  agregando = signal<string | null>(null);
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

  anadirAlCarrito(libro: LibroDetalleResponse): void {
    if (!this.authService.isAuthenticated()) {
      this.avisos.info('Inicia sesión para comprar');
      this.router.navigate(['/login']);
      return;
    }
    this.agregando.set(libro.idLibro);

    this.carritosService.agregarLibro(this.authService.getUid() ?? '', libro.idLibro, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (agregado) => {
          this.agregando.set(null);
          if (agregado) {
            this.avisos.exito(`${libro.titulo} se agregó al carrito`);
          } else {
            this.avisos.info(`${libro.titulo} ya estaba en tu carrito`);
          }
        },
        error: (err) => {
          this.agregando.set(null);
          this.avisos.error(this.mensajeError(err));
        }
      });
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

  private mensajeError(err: HttpErrorResponse): string {
    if (err.status === 404) {
      return 'Error: no se encontró el libro';
    } else if (err.status === 401 || err.status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (err.status === 409) {
      return 'Error: no hay stock suficiente para este libro';
    } else if (err.status === 422) {
      return err.error?.mensaje ?? 'Error: no se pudo agregar el libro al carrito';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}
