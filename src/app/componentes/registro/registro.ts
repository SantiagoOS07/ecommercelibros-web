import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../servicios/usuarios';
import { NotificacionesService } from '../../servicios/notificaciones';
import { RegistrarUsuarioRequest } from '../../modelos/usuario';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private usuariosService = inject(UsuariosService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isLoading = signal(false);
  mostrarContrasenia = signal(false);

  registroForm = inject(FormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    contrasenia: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(72),
      Validators.pattern('^(?=.*[A-Z])(?=.*[0-9]).+$')
    ]],
    telefono: ['', [Validators.required, Validators.maxLength(20)]],
    direccion: ['', [Validators.required, Validators.maxLength(200)]]
  });

  alternarContrasenia(): void {
    this.mostrarContrasenia.update(valor => !valor);
  }

  onSubmit(): void {
    if (this.registroForm.invalid) return;
    this.isLoading.set(true);
    const solicitud = this.registroForm.value as RegistrarUsuarioRequest;

    this.usuariosService.registrar(solicitud)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.avisos.exito('Cuenta creada correctamente');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.avisos.error(this.mensajeError(err.status));
        }
      });
  }

  private mensajeError(status: number): string {
    if (status === 404) {
      return 'Error: no se encontró el recurso solicitado';
    } else if (status === 400) {
      return 'Error: revisa los datos ingresados';
    } else if (status === 401 || status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (status === 409) {
      return 'Error: ya existe una cuenta con ese correo';
    } else if (status === 422) {
      return 'Error: la operación no cumple las reglas del negocio';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}