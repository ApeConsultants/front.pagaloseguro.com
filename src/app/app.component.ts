import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertDialogComponent } from './core/components/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pagalseguro.com';
}
