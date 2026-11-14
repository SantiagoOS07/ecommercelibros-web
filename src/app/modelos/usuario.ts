export type RolUsuario = 'CLIENTE' | 'PROVEEDOR' | 'ADMINISTRADOR';

export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

export interface UsuarioResponse {
  idUsuario: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  rolUsuario: RolUsuario;
  estadoUsuario: EstadoUsuario;
}

export interface RegistrarUsuarioRequest {
  nombre: string;
  correo: string;
  contrasenia: string;
  telefono: string;
  direccion: string;
}

export interface CambiarContraseniaUsuarioRequest {
  contraseniaActual: string;
  nuevaContrasenia: string;
}

export interface ActualizarNombreUsuarioRequest {
  nombre: string;
}

export interface ActualizarCorreoUsuarioRequest {
  correo: string;
}

export interface ActualizarTelefonoUsuarioRequest {
  telefono: string;
}

export interface ActualizarDireccionUsuarioRequest {
  direccion: string;
}

export interface ActualizarRolUsuarioRequest {
  rolUsuario: RolUsuario;
}