import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeStatus = 'earned' | 'in_progress' | 'locked';

interface SaverBadge {
  id: string;
  title: string;
  status: BadgeStatus;
  description: string;
}

@Component({
  selector: 'app-perfil-saver',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-saver.component.html',
  styleUrls: ['./perfil-saver.component.scss'],
})
export class PerfilSaverComponent {
  // Placeholder de insignias; luego se puede conectar al backend
  badges: SaverBadge[] = [
    {
      id: 'first',
      title: 'Primer depósito',
      status: 'earned',
      description: 'Lograste tu primer abono en el ciclo actual.',
    },
    {
      id: 'streak-4',
      title: 'Racha de 4 semanas',
      status: 'in_progress',
      description: 'Mantén tus depósitos semanales para completar la racha.',
    },
    {
      id: 'meta',
      title: 'Meta de ahorro alcanzada',
      status: 'locked',
      description:
        'Se desbloqueará cuando completes el monto meta de tu ciclo de ahorro.',
    },
  ];

  getBadgeClass(badge: SaverBadge): string {
    switch (badge.status) {
      case 'earned':
        return 'badge--earned';
      case 'in_progress':
        return 'badge--in-progress';
      default:
        return 'badge--locked';
    }
  }
}
