import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, concat, toArray } from 'rxjs';
import { AutoresService } from '../../servicios/autores';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { AutorResponse, NACIONALIDADES } from '../../modelos/autor';

type ModoEdicion = 'datos' | 'nacionalidad' | 'eliminar';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-gestion-autores',
  styleUrl: './gestion-autores.css',
  templateUrl: './gestion-autores.html',
})
export class GestionAutores {
  private autoresService = inject(AutoresService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);

  auth = inject(AuthService);

  readonly nacionalidades = NACIONALIDADES;

  autores = signal<AutorResponse[]>([]);
  editando = signal<{ idAutor: string; modo: ModoEdicion } | null>(null);
  isLoading = signal(false);

  registrarForm = this.formBuilder.group({
    idAutor: ['', [Validators.required, Validators.maxLength(36)]],
    nombreAutor: ['', [Validators.required, Validators.maxLength(150)]],
    biografia: ['', Validators.maxLength(2000)],
    nacionalidad: ['', Validators.required]
  });

  datosForm = this.formBuilder.group({
    nombreAutor: ['', [Validators.required, Validators.maxLength(150)]],
    biografia: ['', Validators.maxLength(2000)]
  });

  nacionalidadForm = this.formBuilder.group({
    nacionalidad: ['', Validators.required]
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.autoresService.listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (autores) => this.autores.set(autores),
        error: (err) => {
          this.autores.set([]);
          this.avisos.error(this.mensajeError(err));
        }
      });
  }

  estaEditando(autor: AutorResponse, modo: ModoEdicion): boolean {
    const actual = this.editando();
    return actual !== null && actual.idAutor === autor.idAutor && actual.modo === modo;
  }

  abrirDatos(autor: AutorResponse): void {
    this.datosForm.reset({ nombreAutor: autor.nombreAutor, biografia: autor.biografia ?? '' });
    this.editando.set({ idAutor: autor.idAutor, modo: 'datos' });
  }

  abrirNacionalidad(autor: AutorResponse): void {
    this.nacionalidadForm.reset({ nacionalidad: '' });
    this.editando.set({ idAutor: autor.idAutor, modo: 'nacionalidad' });
  }

  pedirEliminacion(autor: AutorResponse): void {
    this.editando.set({ idAutor: autor.idAutor, modo: 'eliminar' });
  }

  cancelar(): void {
    this.editando.set(null);
  }

  nacionalidadesDisponibles(autor: AutorResponse): string[] {
    return this.nacionalidades.filter(nacionalidad => !autor.nacionalidades.includes(nacionalidad));
  }

  registrar(): void {
    if (this.registrarForm.invalid) return;
    const { idAutor, nombreAutor, biografia, nacionalidad } = this.registrarForm.value;
    this.ejecutar(
      this.autoresService.registrar({
        idAutor: idAutor!.trim(),
        nombreAutor: nombreAutor!.trim(),
        biografia: biografia ?? '',
        nacionalidad: nacionalidad!
      }),
      'Autor registrado'
    );
    this.registrarForm.reset({ idAutor: '', nombreAutor: '', biografia: '', nacionalidad: '' });
  }

  guardarDatos(autor: AutorResponse): void {
    if (this.datosForm.invalid) return;
    const nombreAutor = this.datosForm.value.nombreAutor!.trim();
    const biografia = this.datosForm.value.biografia ?? '';
    const peticiones: Observable<void>[] = [];

    if (nombreAutor !== autor.nombreAutor) {
      peticiones.push(this.autoresService.actualizarNombre(autor.idAutor, { nombreAutor }));
    }
    if (biografia !== (autor.biografia ?? '')) {
      peticiones.push(this.autoresService.actualizarBiografia(autor.idAutor, { biografia }));
    }
    if (peticiones.length === 0) {
      this.avisos.info('No hay cambios para guardar');
      this.cancelar();
      return;
    }
    this.ejecutar(concat(...peticiones).pipe(toArray()), 'Autor actualizado');
  }

  agregarNacionalidad(autor: AutorResponse): void {
    if (this.nacionalidadForm.invalid) return;
    this.ejecutar(
      this.autoresService.agregarNacionalidad(autor.idAutor, { nacionalidad: this.nacionalidadForm.value.nacionalidad! }),
      'Nacionalidad agregada'
    );
  }

  quitarNacionalidad(autor: AutorResponse, nacionalidad: string): void {
    this.ejecutar(this.autoresService.eliminarNacionalidad(autor.idAutor, nacionalidad), 'Nacionalidad quitada');
  }

  eliminar(autor: AutorResponse): void {
    this.ejecutar(this.autoresService.eliminar(autor.idAutor), 'Autor eliminado');
  }

  private ejecutar(peticion: Observable<unknown>, mensaje: string): void {
    this.isLoading.set(true);

    peticion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito(mensaje);
          this.isLoading.set(false);
          this.editando.set(null);
          this.cargar();
        },
        error: (err) => {
          this.avisos.error(this.mensajeError(err));
          this.isLoading.set(false);
          this.cargar();
        }
      });
  }

  private mensajeError(err: HttpErrorResponse): string {
    if (err.status === 404) {
      return 'Error: no se encontró el autor';
    } else if (err.status === 400) {
      return 'Error: revisa los datos ingresados';
    } else if (err.status === 401 || err.status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (err.status === 409) {
      return 'Error: ya existe un autor con ese id';
    } else if (err.status === 422) {
      return err.error?.mensaje ?? 'Error: la operación no cumple las reglas del negocio';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}
