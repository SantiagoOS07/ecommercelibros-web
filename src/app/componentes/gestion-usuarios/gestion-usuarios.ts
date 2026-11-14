import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { UsuariosService } from '../../servicios/usuarios';
import { NotificacionesService } from '../../servicios/notificaciones';
import { RolUsuario, UsuarioResponse } from '../../modelos/usuario';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-gestion-usuarios',
  styleUrl: './gestion-usuarios.css',
  templateUrl: './gestion-usuarios.html',
})
export class GestionUsuarios {
  private usuariosService = inject(UsuariosService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);

  usuarios = signal<UsuarioResponse[]>([]);
  usuarioEncontrado = signal<UsuarioResponse | null>(null);
  isLoading = signal(false);

  roles: RolUsuario[] = ['CLIENTE', 'PROVEEDOR', 'ADMINISTRADOR'];

  correoForm = this.formBuilder.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  rolForm = this.formBuilder.group({
    idUsuario: ['', Validators.required],
    rolUsuario: ['', Validators.required]
  });

  reactivarForm = this.formBuilder.group({
    idUsuario: ['', Validators.required]
  });

  eliminarForm = this.formBuilder.group({
    idUsuario: ['', Validators.required]
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.usuariosService.listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (usuarios) => this.usuarios.set(usuarios),
        error: (err) => {
          this.usuarios.set([]);
          this.avisos.error(this.mensajeError(err.status));
        }
      });
  }

  consultarPorCorreo(): void {
    if (this.correoForm.invalid) return;
    this.isLoading.set(true);

    this.usuariosService.consultarPorCorreo(this.correoForm.value.correo!.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (usuario) => {
          this.usuarioEncontrado.set(usuario);
          this.avisos.exito('Usuario encontrado');
          this.isLoading.set(false);
        },
        error: (err) => {
          this.usuarioEncontrado.set(null);
          this.avisos.error(this.mensajeError(err.status));
          this.isLoading.set(false);
        }
      });
  }

  cambiarRol(): void {
    if (this.rolForm.invalid) return;
    const { idUsuario, rolUsuario } = this.rolForm.value;
    this.ejecutar(
      this.usuariosService.actualizarRol(idUsuario!.trim(), { rolUsuario: rolUsuario as RolUsuario }),
      'Rol actualizado'
    );
    this.rolForm.reset({ idUsuario: '', rolUsuario: '' });
  }

  reactivar(): void {
    if (this.reactivarForm.invalid) return;
    this.ejecutar(
      this.usuariosService.reactivar(this.reactivarForm.value.idUsuario!.trim()),
      'Usuario reactivado'
    );
    this.reactivarForm.reset();
  }

  eliminar(): void {
    if (this.eliminarForm.invalid) return;
    this.ejecutar(
      this.usuariosService.eliminar(this.eliminarForm.value.idUsuario!.trim()),
      'Usuario desactivado'
    );
    this.eliminarForm.reset();
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
      return 'Error: revisa los datos ingresados o el estado del usuario';
    } else if (status === 401 || status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (status === 409) {
      return 'Error: el dato ya existe';
    } else if (status === 422) {
      return 'Error: la operación no cumple las reglas del negocio';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}