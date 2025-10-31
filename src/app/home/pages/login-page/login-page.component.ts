import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  standalone: true,
})
export class LoginPageComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null; // Para mostrar errores de la API
  isLoading: boolean = false; // Para deshabilitar el botón

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.router.navigate(['/pase']); // <-- Redirige al dashboard
        } else {
          // Error controlado por la API
          this.errorMessage = response.msg;
        }
      },
      error: (err) => {
        this.isLoading = false;
        // Error de red o del servidor
        this.errorMessage = 'Error de conexión. Inténtalo de nuevo.';
        console.error(err);
      }
    });
  }
}
