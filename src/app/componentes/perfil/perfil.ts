import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { UsuariosService } from '../../servicios/usuarios';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { CambiarContraseniaUsuarioRequest, UsuarioResponse } from '../../modelos/usuario';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil {
  private usuariosService = inject(UsuariosService);
  private uid = inject(AuthService).getUid() ?? '';
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);

  usuario = signal<UsuarioResponse | null>(null);
  isLoading = signal(false);
  mostrarActual = signal(false);
  mostrarNueva = signal(false);

  nombreForm = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]]
  });

  correoForm = this.formBuilder.group({
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]]
  });

  telefonoForm = this.formBuilder.group({
    telefono: ['', [Validators.required, Validators.maxLength(20)]]
  });

  direccionForm = this.formBuilder.group({
    direccion: ['', [Validators.required, Validators.maxLength(200)]]
  });

  contraseniaForm = this.formBuilder.group({
    contraseniaActual: ['', Validators.required],
    nuevaContrasenia: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.usuariosService.consultarPorId(this.uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (usuario) => {
          this.usuario.set(usuario);
          this.nombreForm.reset({ nombre: usuario.nombre });
          this.correoForm.reset({ correo: usuario.correo });
          this.telefonoForm.reset({ telefono: usuario.telefono });
          this.direccionForm.reset({ direccion: usuario.direccion });
        },
        error: (err) => {
          this.usuario.set(null);
          this.avisos.error(this.mensajeError(err.status));
        }
      });
  }

  actualizarNombre(): void {
    if (this.nombreForm.invalid) return;
    this.ejecutar(
      this.usuariosService.actualizarNombre(this.uid, { nombre: this.nombreForm.value.nombre! }),
      'Nombre actualizado'
    );
  }

  actualizarCorreo(): void {
    if (this.correoForm.invalid) return;
    this.ejecutar(
      this.usuariosService.actualizarCorreo(this.uid, { correo: this.correoForm.value.correo! }),
      'Correo actualizado'
    );
  }

  actualizarTelefono(): void {
    if (this.telefonoForm.invalid) return;
    this.ejecutar(
      this.usuariosService.actualizarTelefono(this.uid, { telefono: this.telefonoForm.value.telefono! }),
      'Teléfono actualizado'
    );
  }

  actualizarDireccion(): void {
    if (this.direccionForm.invalid) return;
    this.ejecutar(
      this.usuariosService.actualizarDireccion(this.uid, { direccion: this.direccionForm.value.direccion! }),
      'Dirección actualizada'
    );
  }

  cambiarContrasenia(): void {
    if (this.contraseniaForm.invalid) return;
    const solicitud = this.contraseniaForm.value as CambiarContraseniaUsuarioRequest;
    this.ejecutar(this.usuariosService.cambiarContrasenia(this.uid, solicitud), 'Contraseña actualizada');
    this.contraseniaForm.reset();
  }

  badgeRol(rol: string): string {
    const colores: Record<string, string> = {
      ADMINISTRADOR: 'bg-danger',
      PROVEEDOR: 'bg-primary',
      CLIENTE: 'bg-info text-dark'
    };
    return colores[rol] ?? 'bg-secondary';
  }

  badgeEstado(estado: string): string {
    return estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary';
  }

  alternarActual(): void {
    this.mostrarActual.update(valor => !valor);
  }

  alternarNueva(): void {
    this.mostrarNueva.update(valor => !valor);
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
      return 'Error: no se encontró el usuario';
    } else if (status === 400) {
      return 'Error: revisa los datos ingresados';
    } else if (status === 401 || status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (status === 409) {
      return 'Error: ese correo ya pertenece a otro usuario';
    } else if (status === 422) {
      return 'Error: la operación no cumple las reglas del negocio';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}
