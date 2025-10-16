import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
    },
    {
        path: '',
        loadChildren: () => import('./pase/pase.module').then(m => m.PaseModule)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
