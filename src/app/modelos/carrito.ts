export type EstadoCarrito = 'CREADO' | 'PROCESANDO' | 'VENDIDO';

export interface ItemCarritoResponse {
  idItemCarrito: string;
  isbnLibro: string;
  tituloLibro: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
}

export interface CarritoResponse {
  idCarrito: string;
  idUsuario: string;
  items: ItemCarritoResponse[];
  estado: EstadoCarrito;
  precioTotal: number;
}

export interface AgregarItemCarritoRequest {
  idLibro: string;
  cantidad: number;
}

export interface ActualizarCantidadItemCarritoRequest {
  cantidad: number;
}
