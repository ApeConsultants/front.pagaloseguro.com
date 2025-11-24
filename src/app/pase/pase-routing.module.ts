import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaseLayoutComponent } from './pase-layout/pase-layout.component';
import { UserListComponent } from './pages/admin/user-list/user-list.component';
import { UserFormComponent } from './pages/admin/user-form/user-form.component';
import { DepositarComponent } from './pages/depositar/depositar.component';
import { AbonoDetailComponent } from './pages/abono-detail/abono-detail.component';
import { AbonosPendientesComponent } from './pages/admin/abonos-pendientes/abonos-pendientes.component';
import { CiclosComponent } from './pages/admin/ciclos/ciclos.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { authGuard } from '../core/guards/auth.guard';
import { PaseDashboardGuard } from '../core/guards/pase-dashboard.guard';
import { PaseProgressPageComponent } from './pages/progreso/progreso.component';
import { AbonoComponent } from './pages/abono/abono.component';
import { ReglamentoComponent } from '../pase/pages/reglamento/reglamento.component';
import { AhorrosAnterioresComponent } from './pages/ahorros-anteriores/ahorros-anteriores.component';
import { PerfilSaverComponent } from './pages/perfil-saver/perfil-saver.component';
import { SoporteTecnicoComponent } from './pages/soporte/soporte.component';
import { AjustesSaverComponent } from './pages/ajustes-saver/ajustes-saver.component';
import { PerfilAdminComponent } from './pages/admin/perfil-admin/perfil-admin.component';
import { PerfilEjecutivoComponent } from './pages/ejecutivo/perfil-ejecutivo/perfil-ejecutivo.component';
import { TicketsComponent } from './pages/admin/tickets/tickets.component';

const routes: Routes = [
  {
    path: '',
    component: PaseLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard
      {
        path: '',
        component: DashboardPageComponent,
        canActivate: [PaseDashboardGuard],
      },

      // Ahorrador
      { path: 'progreso', component: PaseProgressPageComponent },
      {
        path: 'depositar',
        children: [
          {
            path: '',
            component: DepositarComponent,
          },
          {
            path: 'abono/:idSemana',
            component: AbonoComponent,
          },
        ],
      },

      { path: 'ahorros-anteriores', component: AhorrosAnterioresComponent },
      { path: 'reglamento', component: ReglamentoComponent },

      // Perfil / soporte / ajustes (ahorrador)
      { path: 'perfil-saver', component: PerfilSaverComponent },
      { path: 'soporte', component: SoporteTecnicoComponent },
      { path: 'ajustes', component: AjustesSaverComponent },

      // Admin / Ejecutivo
      { path: 'usuarios', component: UserListComponent },
      { path: 'usuarios/nuevo', component: UserFormComponent },
      { path: 'usuarios/editar/:id', component: UserFormComponent },
      { path: 'abonos-pendientes', component: AbonosPendientesComponent },
      { path: 'abonos/:id', component: AbonoDetailComponent },
      { path: 'ciclos', component: CiclosComponent },

      // Perfiles staff + tickets
      { path: 'perfil-admin', component: PerfilAdminComponent },
      { path: 'perfil-ejecutivo', component: PerfilEjecutivoComponent },
      { path: 'tickets', component: TicketsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaseRoutingModule {}
