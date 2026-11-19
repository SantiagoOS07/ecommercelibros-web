import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { LoginRequest } from '../../modelos/auth';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  loginForm = inject(FormBuilder).group({
    correo: ['', [Validators.required, Validators.email]],
    contrasenia: ['', [Validators.required, Validators.minLength(8)]]
  });

  isLoading = signal(false);

  formStatus = toSignal(this.loginForm.statusChanges, { initialValue: 'INVALID' as const });
  canSubmit = computed(() => this.formStatus() === 'VALID' && !this.isLoading());

  onSubmit(): void {
    if (!this.canSubmit()) return;
    this.isLoading.set(true);
    const credenciales = this.loginForm.value as LoginRequest;

    this.authService.login(credenciales)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.authService.guardarSesion(respuesta);
          this.avisos.exito('Sesión iniciada correctamente');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 401) {
            this.avisos.error('Correo o contraseña incorrectos');
          } else {
            this.avisos.error('Ocurrió un error. Intenta de nuevo más tarde');
          }
        }
      });
  }
}
