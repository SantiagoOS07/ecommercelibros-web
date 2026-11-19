import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CarritosService } from '../../servicios/carritos';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { AgregarItemCarritoRequest, CarritoResponse } from '../../modelos/carrito';

@Component({
  imports: [ReactiveFormsModule, DecimalPipe, RouterLink],
  selector: 'app-carrito',
  styleUrl: './carrito.css',
  templateUrl: './carrito.html',
})
export class Carrito {
  private carritosService = inject(CarritosService);
  private authService = inject(AuthService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);

  carrito = signal<CarritoResponse | null>(null);
  cargando = signal(true);
  result = signal('');
  isLoading = signal(false);

  agregarForm = this.formBuilder.group({
    idLibro: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]]
  });

  cantidadForm = this.formBuilder.group({
    idLibro: ['', Validators.required],
    cantidad: [0, [Validators.required, Validators.min(0)]]
  });

  eliminarItemForm = this.formBuilder.group({
    idLibro: ['', Validators.required]
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.carritosService.consultarPorUsuario(this.authService.getUid() ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (carrito) => {
          this.carrito.set(carrito);
          this.cargando.set(false);
        },
        error: (err) => {
          this.carrito.set(null);
          this.cargando.set(false);
          if (err.status !== 404) {
            this.avisos.error(this.mensajeError(err.status));
          }
        }
      });
  }

  crear(): void {
    this.ejecutar(this.carritosService.crear(), 'Carrito creado');
  }

  agregar(): void {
    const carrito = this.carrito();
    if (!carrito || this.agregarForm.invalid) return;
    const solicitud = this.agregarForm.value as AgregarItemCarritoRequest;
    this.ejecutar(this.carritosService.agregarItem(carrito.idCarrito, solicitud), 'Libro agregado al carrito');
    this.agregarForm.reset({ idLibro: '', cantidad: 1 });
  }

  actualizarCantidad(): void {
    const carrito = this.carrito();
    if (!carrito || this.cantidadForm.invalid) return;
    const { idLibro, cantidad } = this.cantidadForm.value;
    this.ejecutar(
      this.carritosService.actualizarCantidad(carrito.idCarrito, idLibro!, { cantidad: cantidad! }),
      'Cantidad actualizada'
    );
    this.cantidadForm.reset({ idLibro: '', cantidad: 0 });
  }

  eliminarItem(): void {
    const carrito = this.carrito();
    if (!carrito || this.eliminarItemForm.invalid) return;
    const idLibro = this.eliminarItemForm.value.idLibro!;
    this.ejecutar(this.carritosService.eliminarItem(carrito.idCarrito, idLibro), 'Libro quitado del carrito');
    this.eliminarItemForm.reset();
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
          this.avisos.error(this.mensajeError(err.status));
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
          this.avisos.error(this.mensajeError(err.status));
          this.isLoading.set(false);
        }
      });
  }

  private mensajeError(status: number): string {
    if (status === 404) {
      return 'Error: no se encontró el carrito o el libro';
    } else if (status === 400) {
      return 'Error: revisa los datos ingresados';
    } else if (status === 401 || status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (status === 409) {
      return 'Error: no hay stock suficiente para ese libro';
    } else if (status === 422) {
      return 'Error: la operación no es válida para el estado actual del carrito';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}
