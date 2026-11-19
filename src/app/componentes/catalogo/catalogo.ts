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
import {
  CATEGORIAS_LIBRO,
  CategoriaLibro,
  ESTADOS_LIBRO,
  EstadoLibro,
  LibroDetalleResponse,
  MONEDAS,
  Moneda
} from '../../modelos/libro';

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
  readonly categorias = CATEGORIAS_LIBRO;
  readonly monedas = MONEDAS;
  readonly estados = ESTADOS_LIBRO;

  pagina = signal(0);
  agregando = signal<string | null>(null);
  texto = signal('');
  categoria = signal<CategoriaLibro | ''>('');
  moneda = signal<Moneda | ''>('');
  estado = signal<EstadoLibro | ''>('');
  precioMin = signal('');
  precioMax = signal('');

  busqueda = toSignal(
    toObservable(this.texto).pipe(
      debounceTime(400),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  private preciosEscritos = computed(() => ({ min: this.precioMin(), max: this.precioMax() }));

  private precios = toSignal(
    toObservable(this.preciosEscritos).pipe(
      debounceTime(400),
      distinctUntilChanged((a, b) => a.min === b.min && a.max === b.max)
    ),
    { initialValue: { min: '', max: '' } }
  );

  rangoInvalido = computed(() => {
    const { min, max } = this.precios();
    return min !== '' && max !== '' && Number(min) > Number(max);
  });

  private consulta = computed(() => {
    const usarPrecio = this.moneda() !== '' && !this.rangoInvalido();
    return {
      pagina: this.pagina(),
      tamanio: this.tamanio,
      palabra: this.busqueda(),
      estado: this.estado(),
      categoria: this.categoria(),
      moneda: this.moneda(),
      precioMin: usarPrecio ? this.precios().min : '',
      precioMax: usarPrecio ? this.precios().max : ''
    };
  });

  respuesta = toSignal(
    toObservable(this.consulta).pipe(
      switchMap(filtro =>
        this.librosService.listar(filtro).pipe(
          catchError((err: HttpErrorResponse) => {
            this.avisos.error(err.status === 422 && err.error?.mensaje
              ? err.error.mensaje
              : 'No pudimos cargar el catálogo. Intenta de nuevo más tarde');
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
  hayFiltros = computed(() =>
    this.texto() !== '' || this.categoria() !== '' || this.moneda() !== '' ||
    this.estado() !== '' || this.precioMin() !== '' || this.precioMax() !== ''
  );

  escribir(valor: string): void {
    this.texto.set(valor);
    this.pagina.set(0);
  }

  cambiarCategoria(valor: string): void {
    this.categoria.set(valor as CategoriaLibro | '');
    this.pagina.set(0);
  }

  cambiarMoneda(valor: string): void {
    this.moneda.set(valor as Moneda | '');
    if (!valor) {
      this.precioMin.set('');
      this.precioMax.set('');
    }
    this.pagina.set(0);
  }

  cambiarEstado(valor: string): void {
    this.estado.set(valor as EstadoLibro | '');
    this.pagina.set(0);
  }

  escribirPrecioMin(valor: string): void {
    this.precioMin.set(valor);
    this.pagina.set(0);
  }

  escribirPrecioMax(valor: string): void {
    this.precioMax.set(valor);
    this.pagina.set(0);
  }

  limpiarFiltros(): void {
    this.texto.set('');
    this.categoria.set('');
    this.moneda.set('');
    this.estado.set('');
    this.precioMin.set('');
    this.precioMax.set('');
    this.pagina.set(0);
  }

  anterior(): void {
    this.pagina.update(p => p - 1);
  }

  siguiente(): void {
    this.pagina.update(p => p + 1);
  }

  puedeGestionar(): boolean {
    return this.authService.tieneRol(['ADMINISTRADOR', 'PROVEEDOR']);
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
