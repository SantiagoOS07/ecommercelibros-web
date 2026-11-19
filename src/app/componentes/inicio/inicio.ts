import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';

@Component({
  imports: [RouterLink],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio {
  isLoggedIn = inject(AuthService).isAuthenticated;
}
