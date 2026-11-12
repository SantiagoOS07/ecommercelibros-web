import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { LibrosService } from '../../servicios/libro';
import { EditorialesService } from '../../servicios/editorial';
import { EditorialResponse } from '../../modelos/editorial';
import { CategoriaLibro, EstadoLibro, Moneda } from '../../modelos/libro';

@Component({
  selector: 'app-gestion-libros',
  imports: [ReactiveFormsModule],
  templateUrl: './gestion-libros.html',
  styleUrl: './gestion-libros.css'
})
export class GestionLibros {
  private fb = inject(FormBuilder).nonNullable;
  private destroyRef = inject(DestroyRef);
  private librosService = inject(LibrosService);
  private editorialesService = inject(EditorialesService);

  result = signal('');
  isLoading = signal(false);
  editoriales = signal<EditorialResponse[]>([]);

  monedas: Moneda[] = ['COP', 'USD'];
  estados: EstadoLibro[] = ['DISPONIBLE', 'AGOTADO', 'DESCONTINUADO'];
  categorias: CategoriaLibro[] = [
    'NOVELA', 'CIENCIA_FICCION', 'FANTASIA', 'MISTERIO', 'ROMANCE',
    'HISTORIA', 'FILOSOFIA', 'CIENCIA', 'TECNOLOGIA', 'PROGRAMACION',
    'BIOGRAFIA', 'POESIA', 'INFANTIL', 'JUVENIL', 'AUTOAYUDA',
    'NEGOCIOS', 'ARTE', 'RELIGION', 'SALUD', 'EDUCACION'
  ];

  editorialForm = this.fb.group({
    nombreEditorial: ['', [Validators.required, Validators.maxLength(150)]],
    paisOrigen: ['', Validators.required],
    descripcionEditorial: ['', Validators.maxLength(2000)]
  });

  libroForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    idAutor: ['', [Validators.required, Validators.maxLength(36)]],
    isbn: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
    descripcion: ['', Validators.maxLength(2000)],
    numeroPaginas: [0, [Validators.required, Validators.min(1)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    moneda: ['' as Moneda, Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    edicion: ['', Validators.maxLength(100)],
    idEditorial: ['', Validators.required],
    fechaPublicacion: ['', Validators.required],
    categoria: ['' as CategoriaLibro, Validators.required],
    imagen: ['', Validators.maxLength(500)],
    estado: ['' as EstadoLibro, Validators.required]
  });

  tituloForm = this.fb.group({
    idLibro: ['', Validators.required],
    titulo: ['', [Validators.required, Validators.maxLength(150)]]
  });

  descripcionForm = this.fb.group({
    idLibro: ['', Validators.required],
    descripcion: ['', Validators.maxLength(2000)]
  });

  numeroPaginasForm = this.fb.group({
    idLibro: ['', Validators.required],
    numeroPaginas: [0, [Validators.required, Validators.min(1)]]
  });

  precioForm = this.fb.group({
    idLibro: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    moneda: ['' as Moneda, Validators.required]
  });

  stockForm = this.fb.group({
    idLibro: ['', Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  edicionForm = this.fb.group({
    idLibro: ['', Validators.required],
    edicion: ['', Validators.maxLength(100)]
  });

  editorialLibroForm = this.fb.group({
    idLibro: ['', Validators.required],
    idEditorial: ['', Validators.required]
  });

  fechaPublicacionForm = this.fb.group({
    idLibro: ['', Validators.required],
    fechaPublicacion: ['', Validators.required]
  });

  categoriaForm = this.fb.group({
    idLibro: ['', Validators.required],
    categoria: ['' as CategoriaLibro, Validators.required]
  });

  imagenForm = this.fb.group({
    idLibro: ['', Validators.required],
    imagen: ['', Validators.maxLength(500)]
  });

  accionesForm = this.fb.group({
    idLibro: ['', Validators.required]
  });

  constructor() {
    this.cargar();
  }

  cargar() {
    this.editorialesService.listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(editoriales => this.editoriales.set(editoriales));
  }

  registrarEditorial() {
    this.ejecutar(
      this.editorialForm,
      () => this.editorialesService.registrar(this.editorialForm.getRawValue()),
      editorial => `Editorial creada con id ${editorial.idEditorial}`,
      () => this.cargar()
    );
  }

  registrarLibro() {
    this.ejecutar(
      this.libroForm,
      () => this.librosService.registrar(this.libroForm.getRawValue()),
      libro => `Libro creado con id ${libro.idLibro}`
    );
  }

  actualizarTitulo() {
    const { idLibro, titulo } = this.tituloForm.getRawValue();
    this.ejecutar(
      this.tituloForm,
      () => this.librosService.actualizarTitulo(idLibro, { titulo }),
      () => 'Título actualizado correctamente'
    );
  }

  actualizarDescripcion() {
    const { idLibro, descripcion } = this.descripcionForm.getRawValue();
    this.ejecutar(
      this.descripcionForm,
      () => this.librosService.actualizarDescripcion(idLibro, { descripcion }),
      () => 'Descripción actualizada correctamente'
    );
  }

  actualizarNumeroPaginas() {
    const { idLibro, numeroPaginas } = this.numeroPaginasForm.getRawValue();
    this.ejecutar(
      this.numeroPaginasForm,
      () => this.librosService.actualizarNumeroPaginas(idLibro, { numeroPaginas }),
      () => 'Número de páginas actualizado correctamente'
    );
  }

  actualizarPrecio() {
    const { idLibro, precio, moneda } = this.precioForm.getRawValue();
    this.ejecutar(
      this.precioForm,
      () => this.librosService.actualizarPrecio(idLibro, { precio, moneda }),
      () => 'Precio actualizado correctamente'
    );
  }

  actualizarStock() {
    const { idLibro, stock } = this.stockForm.getRawValue();
    this.ejecutar(
      this.stockForm,
      () => this.librosService.actualizarStock(idLibro, { stock }),
      () => 'Stock actualizado correctamente'
    );
  }

  actualizarEdicion() {
    const { idLibro, edicion } = this.edicionForm.getRawValue();
    this.ejecutar(
      this.edicionForm,
      () => this.librosService.actualizarEdicion(idLibro, { edicion }),
      () => 'Edición actualizada correctamente'
    );
  }

  actualizarEditorial() {
    const { idLibro, idEditorial } = this.editorialLibroForm.getRawValue();
    this.ejecutar(
      this.editorialLibroForm,
      () => this.librosService.actualizarEditorial(idLibro, { idEditorial }),
      () => 'Editorial del libro actualizada correctamente'
    );
  }

  actualizarFechaPublicacion() {
    const { idLibro, fechaPublicacion } = this.fechaPublicacionForm.getRawValue();
    this.ejecutar(
      this.fechaPublicacionForm,
      () => this.librosService.actualizarFechaPublicacion(idLibro, { fechaPublicacion }),
      () => 'Fecha de publicación actualizada correctamente'
    );
  }

  actualizarCategoria() {
    const { idLibro, categoria } = this.categoriaForm.getRawValue();
    this.ejecutar(
      this.categoriaForm,
      () => this.librosService.actualizarCategoria(idLibro, { categoria }),
      () => 'Categoría actualizada correctamente'
    );
  }

  actualizarImagen() {
    const { idLibro, imagen } = this.imagenForm.getRawValue();
    this.ejecutar(
      this.imagenForm,
      () => this.librosService.actualizarImagen(idLibro, { imagen }),
      () => 'Imagen actualizada correctamente'
    );
  }

  agotar() {
    const { idLibro } = this.accionesForm.getRawValue();
    this.ejecutar(
      this.accionesForm,
      () => this.librosService.agotar(idLibro),
      () => 'Libro marcado como agotado'
    );
  }

  reactivar() {
    const { idLibro } = this.accionesForm.getRawValue();
    this.ejecutar(
      this.accionesForm,
      () => this.librosService.reactivar(idLibro),
      () => 'Libro reactivado correctamente'
    );
  }

  descontinuar() {
    const { idLibro } = this.accionesForm.getRawValue();
    this.ejecutar(
      this.accionesForm,
      () => this.librosService.descontinuar(idLibro),
      () => 'Libro descontinuado correctamente'
    );
  }

  eliminar() {
    const { idLibro } = this.accionesForm.getRawValue();
    this.ejecutar(
      this.accionesForm,
      () => this.librosService.eliminar(idLibro),
      () => 'Libro eliminado correctamente'
    );
  }

  private ejecutar<T>(
    form: FormGroup,
    accion: () => Observable<T>,
    exito: (respuesta: T) => string,
    despues?: () => void
  ) {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.result.set('');
    accion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: respuesta => {
          this.isLoading.set(false);
          this.result.set(exito(respuesta));
          if (despues) {
            despues();
          }
        },
        error: err => {
          this.isLoading.set(false);
          this.result.set(this.mensajeError(err.status));
        }
      });
  }

  private mensajeError(status: number): string {
    switch (status) {
      case 404:
        return 'Error: no se encontró el recurso';
      case 400:
        return 'Error: revisa los datos ingresados';
      case 401:
      case 403:
        return 'Error: no tienes permiso o debes iniciar sesión';
      case 409:
        return 'Error: el dato ya existe o no hay stock suficiente';
      case 422:
        return 'Error: la operación no cumple las reglas del negocio';
      default:
        return 'Ocurrió un error. Intenta de nuevo más tarde';
    }
  }
}