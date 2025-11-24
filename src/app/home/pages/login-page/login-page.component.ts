import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  standalone: true,
})
export class LoginPageComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;
  menuOpen = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService
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

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.router.navigate(['/pase']);
        } else {
          this.dialogService.open({
            title: 'Datos Incorrectos',
            message: response.msg || 'Usuario o contraseña incorrectos.',
            type: 'alert' 
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.dialogService.open({
          title: 'Error de Conexión',
          message: 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.',
          type: 'alert'
        });
      }
    });
  }
}