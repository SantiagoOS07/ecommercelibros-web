import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './servicios/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  auth = inject(AuthService);
  private router = inject(Router);
  title = signal('Ecommerce Libros');
  footer = signal('Universidad del Quindío');

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
