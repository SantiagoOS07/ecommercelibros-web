import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { VentasService } from '../../servicios/ventas';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { VentaResponse } from '../../modelos/venta';

@Component({
  imports: [ReactiveFormsModule, DecimalPipe],
  selector: 'app-gestion-ventas',
  styleUrl: './gestion-ventas.css',
  templateUrl: './gestion-ventas.html',
})
export class GestionVentas {
  private ventasService = inject(VentasService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);

  auth = inject(AuthService);
  ventas = signal<VentaResponse[]>([]);
  usuarioConsultado = signal('');
  isLoading = signal(false);

  buscarForm = this.formBuilder.group({
    idUsuario: ['', Validators.required]
  });

  estadoForm = this.formBuilder.group({
    idVenta: ['', Validators.required]
  });

  buscar(): void {
    if (this.buscarForm.invalid) return;
    this.usuarioConsultado.set(this.buscarForm.value.idUsuario!);
    this.consultar();
  }

  avanzarEstado(): void {
    if (this.estadoForm.invalid) return;
    this.isLoading.set(true);

    this.ventasService.actualizarEstado(this.estadoForm.value.idVenta!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito('Estado de la venta actualizado');
          this.estadoForm.reset();
          this.isLoading.set(false);
          if (this.usuarioConsultado()) {
            this.consultar();
          }
        },
        error: (err) => {
          this.avisos.error(this.mensajeError(err.status));
          this.isLoading.set(false);
        }
      });
  }

  badgeEstado(estado: string): string {
    const colores: Record<string, string> = {
      PREPARANDO: 'bg-warning text-dark',
      ENVIADO: 'bg-info text-dark',
      ENTREGADO: 'bg-success',
      CANCELADO: 'bg-secondary',
      REEMBOLSADO: 'bg-dark'
    };
    return colores[estado] ?? 'bg-secondary';
  }

  private consultar(): void {
    this.ventasService.consultarPorUsuario(this.usuarioConsultado())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ventas) => this.ventas.set(ventas),
        error: (err) => {
          this.ventas.set([]);
          this.avisos.error(this.mensajeError(err.status));
        }
      });
  }

  private mensajeError(status: number): string {
    if (status === 404) {
      return 'Error: no se encontró la venta';
    } else if (status === 400) {
      return 'Error: revisa los datos ingresados';
    } else if (status === 401 || status === 403) {
      return 'Error: no tienes permiso para esta acción';
    } else if (status === 409) {
      return 'Error: la operación entra en conflicto con los datos actuales';
    } else if (status === 422) {
      return 'Error: la venta solo avanza si está en PREPARANDO o ENVIADO';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}
