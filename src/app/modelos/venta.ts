export type EstadoPedido = 'PREPARANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO' | 'REEMBOLSADO';

export interface ItemVentaResponse {
  idItemVenta: string;
  isbnLibro: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  moneda: string;
}

export interface VentaResponse {
  idVenta: string;
  items: ItemVentaResponse[];
  estadoPedido: EstadoPedido;
  fecha: string;
  precio: number;
  moneda: string;
}

export interface SolicitarReembolsoVentaRequest {
  motivo: string;
}
