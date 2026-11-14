import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AutoresService } from '../../servicios/autores';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { AutorResponse } from '../../modelos/autor';

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

  autores = signal<AutorResponse[]>([]);
  isLoading = signal(false);

  registrarForm = this.formBuilder.group({
    idAutor: ['', [Validators.required, Validators.maxLength(36)]],
    nombreAutor: ['', [Validators.required, Validators.maxLength(150)]],
    biografia: ['', Validators.maxLength(2000)],
    nacionalidad: ['', Validators.required]
  });

  nombreForm = this.formBuilder.group({
    idAutor: ['', Validators.required],
    nombreAutor: ['', Validators.required]
  });

  biografiaForm = this.formBuilder.group({
    idAutor: ['', Validators.required],
    biografia: ['', Validators.maxLength(2000)]
  });

  agregarNacionalidadForm = this.formBuilder.group({
    idAutor: ['', Validators.required],
    nacionalidad: ['', Validators.required]
  });

  quitarNacionalidadForm = this.formBuilder.group({
    idAutor: ['', Validators.required],
    nacionalidad: ['', Validators.required]
  });

  eliminarForm = this.formBuilder.group({
    idAutor: ['', Validators.required]
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
          this.avisos.error(this.mensajeError(err.status));
        }
      });
  }

  registrar(): void {
    if (this.registrarForm.invalid) return;
    const { idAutor, nombreAutor, biografia, nacionalidad } = this.registrarForm.value;
    this.ejecutar(
      this.autoresService.registrar({
        idAutor: idAutor!.trim(),
        nombreAutor: nombreAutor!.trim(),
        biografia: biografia ?? '',
        nacionalidad: this.normalizar(nacionalidad!)
      }),
      'Autor registrado'
    );
    this.registrarForm.reset();
  }

  actualizarNombre(): void {
    if (this.nombreForm.invalid) return;
    const { idAutor, nombreAutor } = this.nombreForm.value;
    this.ejecutar(
      this.autoresService.actualizarNombre(idAutor!.trim(), { nombreAutor: nombreAutor!.trim() }),
      'Nombre del autor actualizado'
    );
    this.nombreForm.reset();
  }

  actualizarBiografia(): void {
    if (this.biografiaForm.invalid) return;
    const { idAutor, biografia } = this.biografiaForm.value;
    this.ejecutar(
      this.autoresService.actualizarBiografia(idAutor!.trim(), { biografia: biografia ?? '' }),
      'Biografía actualizada'
    );
    this.biografiaForm.reset();
  }

  agregarNacionalidad(): void {
    if (this.agregarNacionalidadForm.invalid) return;
    const { idAutor, nacionalidad } = this.agregarNacionalidadForm.value;
    this.ejecutar(
      this.autoresService.agregarNacionalidad(idAutor!.trim(), { nacionalidad: this.normalizar(nacionalidad!) }),
      'Nacionalidad agregada'
    );
    this.agregarNacionalidadForm.reset();
  }

  quitarNacionalidad(): void {
    if (this.quitarNacionalidadForm.invalid) return;
    const { idAutor, nacionalidad } = this.quitarNacionalidadForm.value;
    this.ejecutar(
      this.autoresService.eliminarNacionalidad(idAutor!.trim(), this.normalizar(nacionalidad!)),
      'Nacionalidad quitada'
    );
    this.quitarNacionalidadForm.reset();
  }

  eliminar(): void {
    if (this.eliminarForm.invalid) return;
    this.ejecutar(
      this.autoresService.eliminar(this.eliminarForm.value.idAutor!.trim()),
      'Autor eliminado'
    );
    this.eliminarForm.reset();
  }

  private normalizar(nacionalidad: string): string {
    return nacionalidad.trim().toUpperCase();
  }

  private ejecutar(peticion: Observable<unknown>, mensaje: string): void {
    this.isLoading.set(true);

    peticion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito(mensaje);
          this.isLoading.set(false);
          this.cargar();
        },
        error: (err) => {
          this.avisos.error(this.mensajeError(err.status));
          this.isLoading.set(false);
        }
      });
  }

  private mensajeError(status: number): string {
    if (status === 404) {
      return 'Error: no se encontró el autor';
    } else if (status === 400) {
      return 'Error: revisa los datos ingresados';
    } else if (status === 401 || status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (status === 409) {
      return 'Error: ya existe un autor con ese id';
    } else if (status === 422) {
      return 'Error: la operación no cumple las reglas del negocio';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}