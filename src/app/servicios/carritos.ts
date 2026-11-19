import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap, throwError } from 'rxjs';
import {
  ActualizarCantidadItemCarritoRequest,
  AgregarItemCarritoRequest,
  CarritoResponse
} from '../modelos/carrito';
import { VentaResponse } from '../modelos/venta';

@Injectable({ providedIn: 'root' })
export class CarritosService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/carritos';

  crear() {
    return this.http.post<CarritoResponse>(this.url, null);
  }

  consultarPorUsuario(idUsuario: string) {
    return this.http.get<CarritoResponse>(`${this.url}?idUsuario=${idUsuario}`);
  }

  obtenerOCrear(idUsuario: string) {
    return this.consultarPorUsuario(idUsuario).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 404) {
          return throwError(() => error);
        }
        return this.crear().pipe(
          catchError((errorCrear: HttpErrorResponse) =>
            errorCrear.status === 409
              ? this.consultarPorUsuario(idUsuario)
              : throwError(() => errorCrear)
          )
        );
      })
    );
  }

  agregarLibro(idUsuario: string, idLibro: string, cantidad: number) {
    return this.obtenerOCrear(idUsuario).pipe(
      switchMap(carrito =>
        carrito.items.some(item => item.idLibro === idLibro)
          ? of(false)
          : this.agregarItem(carrito.idCarrito, { idLibro, cantidad }).pipe(map(() => true))
      )
    );
  }

  agregarItem(idCarrito: string, solicitud: AgregarItemCarritoRequest) {
    return this.http.post<void>(`${this.url}/${idCarrito}/items`, solicitud);
  }

  actualizarCantidad(idCarrito: string, idLibro: string, solicitud: ActualizarCantidadItemCarritoRequest) {
    return this.http.put<void>(`${this.url}/${idCarrito}/items/${idLibro}`, solicitud);
  }

  eliminarItem(idCarrito: string, idLibro: string) {
    return this.http.delete<void>(`${this.url}/${idCarrito}/items/${idLibro}`);
  }

  confirmar(idCarrito: string) {
    return this.http.put<void>(`${this.url}/${idCarrito}/confirmar`, null);
  }

  cancelarConfirmacion(idCarrito: string) {
    return this.http.put<void>(`${this.url}/${idCarrito}/cancelar-confirmacion`, null);
  }

  completarVenta(idCarrito: string) {
    return this.http.put<VentaResponse>(`${this.url}/${idCarrito}/completar-venta`, null);
  }

  eliminar(idCarrito: string) {
    return this.http.delete<void>(`${this.url}/${idCarrito}`);
  }
}
