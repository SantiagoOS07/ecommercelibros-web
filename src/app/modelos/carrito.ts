export type EstadoCarrito = 'CREADO' | 'PROCESANDO' | 'VENDIDO';

export interface ItemCarritoResponse {
  idItemCarrito: string;
  idLibro: string | null;
  isbnLibro: string;
  tituloLibro: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  moneda: string;
}

export interface CarritoResponse {
  idCarrito: string;
  idUsuario: string;
  items: ItemCarritoResponse[];
  estado: EstadoCarrito;
  precioTotal: number;
  moneda: string;
}

export interface AgregarItemCarritoRequest {
  idLibro: string;
  cantidad: number;
}

export interface ActualizarCantidadItemCarritoRequest {
  cantidad: number;
}
