import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ajustes-saver',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ajustes-saver.component.html',
  styleUrls: ['./ajustes-saver.component.scss'],
})
export class AjustesSaverComponent {
  emailNotifications = true;
  appNotifications = true;
  darkMode = false;
  language = 'es';
}
