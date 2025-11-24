import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-soporte-tecnico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.scss'],
})
export class SoporteTecnicoComponent {
  sending = false;
  submitted = false;

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.sending = true;

    // Placeholder: aquí iría la llamada real al backend
    setTimeout(() => {
      this.sending = false;
      this.submitted = true;
      form.resetForm();
    }, 400);
  }
}
