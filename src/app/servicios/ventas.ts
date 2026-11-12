import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SolicitarReembolsoVentaRequest, VentaResponse } from '../modelos/venta';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/ventas';

  consultarPorUsuario(idUsuario: string) {
    return this.http.get<VentaResponse[]>(`${this.url}?idUsuario=${idUsuario}`);
  }

  actualizarEstado(idVenta: string) {
    return this.http.put<void>(`${this.url}/${idVenta}/estado`, null);
  }

  cancelar(idVenta: string) {
    return this.http.put<void>(`${this.url}/${idVenta}/cancelar`, null);
  }

  solicitarReembolso(idVenta: string, solicitud: SolicitarReembolsoVentaRequest) {
    return this.http.put<void>(`${this.url}/${idVenta}/reembolso`, solicitud);
  }
}
