import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { LibrosService } from '../../servicios/libro';
import { EditorialesService } from '../../servicios/editorial';
import { AutoresService } from '../../servicios/autores';
import { EditorialResponse } from '../../modelos/editorial';
import { AutorResponse } from '../../modelos/autor';
import { CATEGORIAS_LIBRO, CategoriaLibro, ESTADOS_LIBRO, EstadoLibro, MONEDAS, Moneda } from '../../modelos/libro';
import { NotificacionesService } from '../../servicios/notificaciones';

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
  private autoresService = inject(AutoresService);
  private avisos = inject(NotificacionesService);

  isLoading = signal(false);
  editoriales = signal<EditorialResponse[]>([]);
  autores = signal<AutorResponse[]>([]);

  monedas = MONEDAS;
  estados = ESTADOS_LIBRO;
  categorias = CATEGORIAS_LIBRO;

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

  constructor() {
    this.cargar();
    this.autoresService.listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(autores => this.autores.set(autores));
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
      libro => `Libro "${libro.titulo}" creado correctamente`,
      () => this.libroForm.reset()
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
    accion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: respuesta => {
          this.isLoading.set(false);
          this.avisos.exito(exito(respuesta));
          if (despues) {
            despues();
          }
        },
        error: err => {
          this.isLoading.set(false);
          this.avisos.error(this.mensajeError(err.status));
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
