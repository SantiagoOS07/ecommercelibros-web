import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { LibrosService } from '../../servicios/libro';
import { CarritosService } from '../../servicios/carritos';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { LibroResponse } from '../../modelos/libro';

@Component({
  selector: 'app-detalle-libro',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './detalle-libro.html',
  styleUrl: './detalle-libro.css'
})
export class DetalleLibro {
  private librosService = inject(LibrosService);
  private carritosService = inject(CarritosService);
  private authService = inject(AuthService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private id = inject(ActivatedRoute).snapshot.paramMap.get('id') as string;

  isLoading = signal(false);

  libro = toSignal<LibroResponse | null>(
    this.librosService.consultarPorId(this.id).pipe(
      catchError(() => {
        this.avisos.error('Error: no se encontró el libro');
        this.router.navigate(['/catalogo']);
        return of(null);
      })
    ),
    { initialValue: null }
  );

  comprar(libro: LibroResponse): void {
    if (!this.authService.isAuthenticated()) {
      this.avisos.info('Inicia sesión para comprar');
      this.router.navigate(['/login']);
      return;
    }
    this.isLoading.set(true);

    this.carritosService.agregarLibro(this.authService.getUid() ?? '', libro.idLibro, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (agregado) => {
          this.isLoading.set(false);
          if (agregado) {
            this.avisos.exito('Libro agregado al carrito');
          } else {
            this.avisos.info('Este libro ya estaba en tu carrito');
          }
          this.router.navigate(['/carrito']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.avisos.error(this.mensajeError(err));
        }
      });
  }

  badgeEstado(estado: string): string {
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-success';
      case 'AGOTADO':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  private mensajeError(err: HttpErrorResponse): string {
    if (err.status === 404) {
      return 'Error: no se encontró el libro';
    } else if (err.status === 401 || err.status === 403) {
      return 'Error: no tienes permiso o debes iniciar sesión';
    } else if (err.status === 409) {
      return 'Error: no hay stock suficiente para este libro';
    } else if (err.status === 422) {
      return err.error?.mensaje ?? 'Error: no se pudo agregar el libro al carrito';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde';
  }
}
