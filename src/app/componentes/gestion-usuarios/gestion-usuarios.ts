import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { UsuariosService } from '../../servicios/usuarios';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { RolUsuario, UsuarioResponse } from '../../modelos/usuario';

@Component({
  imports: [],
  selector: 'app-gestion-usuarios',
  styleUrl: './gestion-usuarios.css',
  templateUrl: './gestion-usuarios.html',
})
export class GestionUsuarios {
  private usuariosService = inject(UsuariosService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  private uidActual = inject(AuthService).getUid();

  readonly roles: RolUsuario[] = ['CLIENTE', 'PROVEEDOR', 'ADMINISTRADOR'];

  usuarios = signal<UsuarioResponse[]>([]);
  confirmando = signal<string | null>(null);
  texto = signal('');
  isLoading = signal(false);

  busqueda = toSignal(
    toObservable(this.texto).pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  filtrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) {
      return this.usuarios();
    }
    return this.usuarios().filter(usuario =>
      usuario.nombre.toLowerCase().includes(termino) || usuario.correo.toLowerCase().includes(termino)
    );
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

  escribir(valor: string): void {
    this.texto.set(valor);
  }

  esActual(usuario: UsuarioResponse): boolean {
    return usuario.idUsuario === this.uidActual;
  }

  cambiarRol(usuario: UsuarioResponse, rol: string): void {
    if (rol === usuario.rolUsuario) return;
    this.ejecutar(
      this.usuariosService.actualizarRol(usuario.idUsuario, { rolUsuario: rol as RolUsuario }),
      `Rol de ${usuario.nombre} actualizado a ${rol}`
    );
  }

  reactivar(usuario: UsuarioResponse): void {
    this.ejecutar(this.usuariosService.reactivar(usuario.idUsuario), `${usuario.nombre} fue reactivado`);
  }

  pedirEliminacion(usuario: UsuarioResponse): void {
    this.confirmando.set(usuario.idUsuario);
  }

  cancelarEliminacion(): void {
    this.confirmando.set(null);
  }

  eliminar(usuario: UsuarioResponse): void {
    this.ejecutar(this.usuariosService.eliminar(usuario.idUsuario), `${usuario.nombre} fue desactivado`);
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
          this.confirmando.set(null);
          this.cargar();
        },
        error: (err) => {
          this.avisos.error(this.mensajeError(err.status));
          this.isLoading.set(false);
          this.cargar();
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
