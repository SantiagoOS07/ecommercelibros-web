export interface LoginRequest {
  correo: string;
  contrasenia: string;
}

export interface TokenResponse {
  token: string;
  type: string;
  expireAt: string;
  roles: string[];
}
