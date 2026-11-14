import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../servicios/auth';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = this.authService.isAuthenticated;

  tieneRol(roles: string[]): boolean {
    return this.authService.tieneRol(roles);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}