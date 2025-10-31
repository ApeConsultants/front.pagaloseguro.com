import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaseHeaderComponent } from '../components/pase-header/pase-header.component';
import { PaseSidebarComponent } from '../components/pase-sidebar/pase-sidebar.component';

@Component({
  selector: 'app-pase-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    PaseHeaderComponent,
    PaseSidebarComponent
  ],
  templateUrl: './pase-layout.component.html',
  styleUrl: './pase-layout.component.scss'
})
export class PaseLayoutComponent {

}
