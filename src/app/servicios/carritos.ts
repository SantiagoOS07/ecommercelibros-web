import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
