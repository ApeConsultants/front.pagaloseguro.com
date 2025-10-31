import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
    },
    {
        path: 'pase',
        loadChildren: () => import('./pase/pase.module').then(m => m.PaseModule),
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
