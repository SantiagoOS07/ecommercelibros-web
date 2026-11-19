import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Observable, catchError, concat, of, toArray } from 'rxjs';
import { LibrosService } from '../../servicios/libro';
import { EditorialesService } from '../../servicios/editorial';
import { AutoresService } from '../../servicios/autores';
import { NotificacionesService } from '../../servicios/notificaciones';
import { CATEGORIAS_LIBRO, CategoriaLibro, LibroResponse, MONEDAS, Moneda } from '../../modelos/libro';

@Component({
  selector: 'app-editar-libro',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './editar-libro.html',
  styleUrl: './editar-libro.css'
})
export class EditarLibro {
  private fb = inject(FormBuilder).nonNullable;
  private destroyRef = inject(DestroyRef);
  private librosService = inject(LibrosService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private id = inject(ActivatedRoute).snapshot.paramMap.get('id') as string;

  readonly monedas = MONEDAS;
  readonly categorias = CATEGORIAS_LIBRO;

  libro = signal<LibroResponse | null>(null);
  isLoading = signal(false);
  confirmandoEliminar = signal(false);

  editoriales = toSignal(
    inject(EditorialesService).listar().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  private autores = toSignal(
    inject(AutoresService).listar().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  nombreAutor = computed(() => {
    const libro = this.libro();
    if (!libro) {
      return '';
    }
    return this.autores().find(autor => autor.idAutor === libro.idAutor)?.nombreAutor ?? libro.idAutor;
  });

  libroForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', Validators.maxLength(2000)],
    numeroPaginas: [0, [Validators.required, Validators.min(1)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    moneda: ['' as Moneda, Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    edicion: ['', Validators.maxLength(100)],
    idEditorial: ['', Validators.required],
    fechaPublicacion: ['', Validators.required],
    categoria: ['' as CategoriaLibro, Validators.required],
    imagen: ['', Validators.maxLength(500)]
  });

  descuentoForm = this.fb.group({
    porcentaje: [10, [Validators.required, Validators.min(1), Validators.max(99)]],
    motivo: ['', [Validators.required, Validators.maxLength(100)]],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required]
  });

  estadoDescuento = computed(() => {
    const libro = this.libro();
    if (!libro || libro.porcentajeDescuento === null) {
      return null;
    }
    if (libro.descuentoVigente) {
      return 'VIGENTE';
    }
    return (libro.fechaInicioDescuento ?? '') > this.hoy() ? 'PROGRAMADO' : 'VENCIDO';
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.librosService.consultarPorId(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (libro) => {
          this.libro.set(libro);
          this.libroForm.reset({
            titulo: libro.titulo,
            descripcion: libro.descripcion ?? '',
            numeroPaginas: libro.numeroPaginas,
            precio: libro.precio,
            moneda: libro.moneda,
            stock: libro.stock,
            edicion: libro.edicion ?? '',
            idEditorial: libro.idEditorial,
            fechaPublicacion: libro.fechaPublicacion,
            categoria: libro.categoria,
            imagen: libro.imagen ?? ''
          });
          this.descuentoForm.reset({
            porcentaje: libro.porcentajeDescuento ?? 10,
            motivo: libro.motivoDescuento ?? '',
            fechaInicio: libro.fechaInicioDescuento ?? this.hoy(),
            fechaFin: libro.fechaFinDescuento ?? ''
          });
        },
        error: () => {
          this.avisos.error('Error: no se encontró el libro');
          this.router.navigate(['/catalogo']);
        }
      });
  }

  guardar(): void {
    const libro = this.libro();
    if (!libro) return;
    if (this.libroForm.invalid) {
      this.libroForm.markAllAsTouched();
      return;
    }
    const cambios = this.libroForm.getRawValue();
    const peticiones: Observable<void>[] = [];

    if (cambios.titulo !== libro.titulo) {
      peticiones.push(this.librosService.actualizarTitulo(this.id, { titulo: cambios.titulo }));
    }
    if (cambios.descripcion !== (libro.descripcion ?? '')) {
      peticiones.push(this.librosService.actualizarDescripcion(this.id, { descripcion: cambios.descripcion }));
    }
    if (cambios.numeroPaginas !== libro.numeroPaginas) {
      peticiones.push(this.librosService.actualizarNumeroPaginas(this.id, { numeroPaginas: cambios.numeroPaginas }));
    }
    if (cambios.precio !== libro.precio || cambios.moneda !== libro.moneda) {
      peticiones.push(this.librosService.actualizarPrecio(this.id, { precio: cambios.precio, moneda: cambios.moneda }));
    }
    if (cambios.stock !== libro.stock) {
      peticiones.push(this.librosService.actualizarStock(this.id, { stock: cambios.stock }));
    }
    if (cambios.edicion !== (libro.edicion ?? '')) {
      peticiones.push(this.librosService.actualizarEdicion(this.id, { edicion: cambios.edicion }));
    }
    if (cambios.idEditorial !== libro.idEditorial) {
      peticiones.push(this.librosService.actualizarEditorial(this.id, { idEditorial: cambios.idEditorial }));
    }
    if (cambios.fechaPublicacion !== libro.fechaPublicacion) {
      peticiones.push(this.librosService.actualizarFechaPublicacion(this.id, { fechaPublicacion: cambios.fechaPublicacion }));
    }
    if (cambios.categoria !== libro.categoria) {
      peticiones.push(this.librosService.actualizarCategoria(this.id, { categoria: cambios.categoria }));
    }
    if (cambios.imagen !== (libro.imagen ?? '')) {
      peticiones.push(this.librosService.actualizarImagen(this.id, { imagen: cambios.imagen }));
    }

    if (peticiones.length === 0) {
      this.avisos.info('No hay cambios para guardar');
      return;
    }
    this.ejecutar(concat(...peticiones).pipe(toArray()), 'Libro actualizado correctamente');
  }

  descartar(): void {
    this.cargar();
  }

  fechasInvalidas(): boolean {
    const { fechaInicio, fechaFin } = this.descuentoForm.getRawValue();
    return fechaInicio !== '' && fechaFin !== '' && fechaFin < fechaInicio;
  }

  aplicarDescuento(): void {
    if (this.descuentoForm.invalid || this.fechasInvalidas()) {
      this.descuentoForm.markAllAsTouched();
      return;
    }
    const descuento = this.descuentoForm.getRawValue();
    this.ejecutar(
      this.librosService.aplicarDescuento(this.id, { ...descuento, motivo: descuento.motivo.trim() }),
      'Descuento aplicado correctamente'
    );
  }

  quitarDescuento(): void {
    this.ejecutar(this.librosService.quitarDescuento(this.id), 'Descuento quitado');
  }

  badgeDescuento(estado: string): string {
    const colores: Record<string, string> = {
      VIGENTE: 'bg-danger',
      PROGRAMADO: 'bg-info text-dark',
      VENCIDO: 'bg-secondary'
    };
    return colores[estado] ?? 'bg-secondary';
  }

  agotar(): void {
    this.ejecutar(this.librosService.agotar(this.id), 'El libro quedó AGOTADO');
  }

  reactivar(): void {
    this.ejecutar(this.librosService.reactivar(this.id), 'El libro quedó DISPONIBLE');
  }

  descontinuar(): void {
    this.ejecutar(this.librosService.descontinuar(this.id), 'El libro quedó DESCONTINUADO');
  }

  eliminar(): void {
    this.isLoading.set(true);

    this.librosService.eliminar(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.avisos.exito('Libro eliminado correctamente');
          this.router.navigate(['/catalogo']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.confirmandoEliminar.set(false);
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

  private hoy(): string {
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  private ejecutar(peticion: Observable<unknown>, mensaje: string): void {
    this.isLoading.set(true);

    peticion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.avisos.exito(mensaje);
          this.cargar();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.avisos.error(this.mensajeError(err));
          this.cargar();
        }
      });
  }

  private mensajeError(err: HttpErrorResponse): string {
    if (err.status === 404) {
      return 'Error: no se encontró el libro';
    } else if (err.status === 400) {
      return 'Error: revisa los datos ingresados';
    } else if (err.status === 401 || err.status === 403) {
      return 'Error: no tienes permiso para editar libros';
    } else if (err.status === 409) {
      return 'Error: el libro cambió mientras lo editabas. Revisa los datos e intenta de nuevo';
    } else if (err.status === 422) {
      return err.error?.mensaje ?? 'Error: la operación no cumple las reglas del negocio';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}
