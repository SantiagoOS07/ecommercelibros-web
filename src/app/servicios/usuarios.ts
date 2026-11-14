import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ActualizarCorreoUsuarioRequest,
  ActualizarDireccionUsuarioRequest,
  ActualizarNombreUsuarioRequest,
  ActualizarRolUsuarioRequest,
  ActualizarTelefonoUsuarioRequest,
  CambiarContraseniaUsuarioRequest,
  RegistrarUsuarioRequest,
  UsuarioResponse
} from '../modelos/usuario';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/usuarios';

  registrar(solicitud: RegistrarUsuarioRequest) {
    return this.http.post<UsuarioResponse>(this.url, solicitud);
  }

  listar() {
    return this.http.get<UsuarioResponse[]>(this.url);
  }

  consultarPorId(idUsuario: string) {
    return this.http.get<UsuarioResponse>(`${this.url}/${idUsuario}`);
  }

  consultarPorCorreo(correo: string) {
    return this.http.get<UsuarioResponse>(`${this.url}/correo/${correo}`);
  }

  actualizarNombre(idUsuario: string, solicitud: ActualizarNombreUsuarioRequest) {
    return this.http.put<void>(`${this.url}/${idUsuario}/nombre`, solicitud);
  }

  actualizarCorreo(idUsuario: string, solicitud: ActualizarCorreoUsuarioRequest) {
    return this.http.put<void>(`${this.url}/${idUsuario}/correo`, solicitud);
  }

  actualizarTelefono(idUsuario: string, solicitud: ActualizarTelefonoUsuarioRequest) {
    return this.http.put<void>(`${this.url}/${idUsuario}/telefono`, solicitud);
  }

  actualizarDireccion(idUsuario: string, solicitud: ActualizarDireccionUsuarioRequest) {
    return this.http.put<void>(`${this.url}/${idUsuario}/direccion`, solicitud);
  }

  cambiarContrasenia(idUsuario: string, solicitud: CambiarContraseniaUsuarioRequest) {
    return this.http.put<void>(`${this.url}/${idUsuario}/contrasenia`, solicitud);
  }

  actualizarRol(idUsuario: string, solicitud: ActualizarRolUsuarioRequest) {
    return this.http.put<void>(`${this.url}/${idUsuario}/rol`, solicitud);
  }

  reactivar(idUsuario: string) {
    return this.http.put<void>(`${this.url}/${idUsuario}/reactivar`, null);
  }

  eliminar(idUsuario: string) {
    return this.http.delete<void>(`${this.url}/${idUsuario}`);
  }
}