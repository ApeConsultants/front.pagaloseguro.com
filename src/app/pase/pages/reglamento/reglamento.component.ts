import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reglamento',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reglamento.component.html',
  styleUrls: ['./reglamento.component.scss'],
})
export class ReglamentoComponent {}