import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { VentasService } from '../../servicios/ventas';
import { AuthService } from '../../servicios/auth';
import { VentaResponse } from '../../modelos/venta';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-mis-compras',
  styleUrl: './mis-compras.css',
  templateUrl: './mis-compras.html',
})
export class MisCompras {
  private ventasService = inject(VentasService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);

  ventas = signal<VentaResponse[]>([]);
  result = signal('');
  isLoading = signal(false);

  cancelarForm = this.formBuilder.group({
    idVenta: ['', Validators.required]
  });

  reembolsoForm = this.formBuilder.group({
    idVenta: ['', Validators.required],
    motivo: ['', Validators.required]
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.ventasService.consultarPorUsuario(this.authService.getUid() ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ventas) => this.ventas.set(ventas),
        error: (err) => this.result.set(this.mensajeError(err.status))
      });
  }

  cancelar(): void {
    if (this.cancelarForm.invalid) return;
    const idVenta = this.cancelarForm.value.idVenta!;
    this.ejecutar(this.ventasService.cancelar(idVenta), 'Venta cancelada');
    this.cancelarForm.reset();
  }

  solicitarReembolso(): void {
    if (this.reembolsoForm.invalid) return;
    const { idVenta, motivo } = this.reembolsoForm.value;
    this.ejecutar(this.ventasService.solicitarReembolso(idVenta!, { motivo: motivo! }), 'Reembolso solicitado');
    this.reembolsoForm.reset();
  }

  private ejecutar(peticion: Observable<unknown>, mensaje: string): void {
    this.isLoading.set(true);

    peticion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.result.set(mensaje);
          this.isLoading.set(false);
          this.cargar();
        },
        error: (err) => {
          this.result.set(this.mensajeError(err.status));
          this.isLoading.set(false);
        }
      });
  }

  private mensajeError(status: number): string {
    if (status === 404) {
      return 'Error: no se encontró la venta';
    } else if (status === 400) {
      return 'Error: revisa los datos ingresados';
    } else if (status === 401 || status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (status === 409) {
      return 'Error: la operación entra en conflicto con los datos actuales';
    } else if (status === 422) {
      return 'Error: la operación no es válida para el estado actual de la venta';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}
