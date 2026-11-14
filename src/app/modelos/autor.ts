export interface AutorResponse {
  idAutor: string;
  nombreAutor: string;
  biografia: string;
  nacionalidades: string[];
}

export interface RegistrarAutorRequest {
  idAutor: string;
  nombreAutor: string;
  biografia: string;
  nacionalidad: string;
}

export interface ActualizarNombreAutorRequest {
  nombreAutor: string;
}

export interface ActualizarBiografiaAutorRequest {
  biografia: string;
}

export interface AgregarNacionalidadRequest {
  nacionalidad: string;
}