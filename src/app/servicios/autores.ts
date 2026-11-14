import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ActualizarBiografiaAutorRequest,
  ActualizarNombreAutorRequest,
  AgregarNacionalidadRequest,
  AutorResponse,
  RegistrarAutorRequest
} from '../modelos/autor';

@Injectable({ providedIn: 'root' })
export class AutoresService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/autores';

  listar() {
    return this.http.get<AutorResponse[]>(this.url);
  }

  registrar(solicitud: RegistrarAutorRequest) {
    return this.http.post<AutorResponse>(this.url, solicitud);
  }

  actualizarNombre(idAutor: string, solicitud: ActualizarNombreAutorRequest) {
    return this.http.put<void>(`${this.url}/${idAutor}/nombre`, solicitud);
  }

  actualizarBiografia(idAutor: string, solicitud: ActualizarBiografiaAutorRequest) {
    return this.http.put<void>(`${this.url}/${idAutor}/biografia`, solicitud);
  }

  agregarNacionalidad(idAutor: string, solicitud: AgregarNacionalidadRequest) {
    return this.http.post<void>(`${this.url}/${idAutor}/nacionalidades`, solicitud);
  }

  eliminarNacionalidad(idAutor: string, nacionalidad: string) {
    return this.http.delete<void>(`${this.url}/${idAutor}/nacionalidades/${nacionalidad}`);
  }

  eliminar(idAutor: string) {
    return this.http.delete<void>(`${this.url}/${idAutor}`);
  }
}