import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CarritosService } from '../../servicios/carritos';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { CarritoResponse, ItemCarritoResponse } from '../../modelos/carrito';

@Component({
  imports: [DecimalPipe, RouterLink],
  selector: 'app-carrito',
  styleUrl: './carrito.css',
  templateUrl: './carrito.html',
})
export class Carrito {
  private carritosService = inject(CarritosService);
  private authService = inject(AuthService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  carrito = signal<CarritoResponse | null>(null);
  cargando = signal(true);
  result = signal('');
  isLoading = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.carritosService.obtenerOCrear(this.authService.getUid() ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (carrito) => {
          this.carrito.set(carrito);
          this.cargando.set(false);
        },
        error: (err) => {
          this.carrito.set(null);
          this.cargando.set(false);
          this.avisos.error(this.mensajeError(err));
        }
      });
  }

  cambiarCantidad(item: ItemCarritoResponse, cambio: number): void {
    const carrito = this.carrito();
    if (!carrito || !item.idLibro) return;
    this.ejecutar(
      this.carritosService.actualizarCantidad(carrito.idCarrito, item.idLibro, { cantidad: item.cantidad + cambio }),
      'Cantidad actualizada'
    );
  }

  quitar(item: ItemCarritoResponse): void {
    const carrito = this.carrito();
    if (!carrito || !item.idLibro) return;
    this.ejecutar(this.carritosService.eliminarItem(carrito.idCarrito, item.idLibro), 'Libro quitado del carrito');
  }

  confirmar(): void {
    const carrito = this.carrito();
    if (!carrito) return;
    this.ejecutar(this.carritosService.confirmar(carrito.idCarrito), 'Carrito confirmado');
  }

  cancelarConfirmacion(): void {
    const carrito = this.carrito();
    if (!carrito) return;
    this.ejecutar(this.carritosService.cancelarConfirmacion(carrito.idCarrito), 'Confirmación cancelada');
  }

  eliminar(): void {
    const carrito = this.carrito();
    if (!carrito) return;
    this.ejecutar(this.carritosService.eliminar(carrito.idCarrito), 'Carrito eliminado');
  }

  completarCompra(): void {
    const carrito = this.carrito();
    if (!carrito) return;
    this.isLoading.set(true);

    this.carritosService.completarVenta(carrito.idCarrito)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (venta) => {
          this.result.set(`Venta ${venta.idVenta} creada en estado ${venta.estadoPedido}`);
          this.avisos.exito('Compra realizada correctamente');
          this.isLoading.set(false);
          this.cargar();
        },
        error: (err) => {
          this.avisos.error(this.mensajeError(err));
          this.isLoading.set(false);
        }
      });
  }

  badgeEstado(estado: string): string {
    const colores: Record<string, string> = {
      CREADO: 'bg-primary',
      PROCESANDO: 'bg-warning text-dark',
      VENDIDO: 'bg-success'
    };
    return colores[estado] ?? 'bg-secondary';
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
          this.avisos.error(this.mensajeError(err));
          this.isLoading.set(false);
        }
      });
  }

  private mensajeError(err: HttpErrorResponse): string {
    if (err.status === 404) {
      return 'Error: no se encontró el carrito o el libro';
    } else if (err.status === 400) {
      return 'Error: revisa los datos ingresados';
    } else if (err.status === 401 || err.status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (err.status === 409) {
      return 'Error: no hay stock suficiente para ese libro';
    } else if (err.status === 422) {
      return err.error?.mensaje ?? 'Error: la operación no es válida para el estado actual del carrito';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}
