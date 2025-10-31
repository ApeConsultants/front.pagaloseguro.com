import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PaseLayoutComponent } from "./pase-layout/pase-layout.component";
import { PaseHomePageComponent } from "./pages/pase-home-page/pase-home-page.component";
import { UserListComponent } from "./pages/admin/user-list/user-list.component";
import { UserFormComponent } from "./pages/admin/user-form/user-form.component";

const routes: Routes = [
  {
    path: '', 
    component: PaseLayoutComponent,
    children: [
      // Dashboard
      { path: '', component: PaseHomePageComponent, pathMatch: 'full' },
      
      // Rutas del CRUD de Usuarios
      { path: 'usuarios', component: UserListComponent },
      { path: 'usuarios/nuevo', component: UserFormComponent },
      { path: 'usuarios/editar/:id', component: UserFormComponent },
      
      // ... aquí irán más rutas hijas de 'pase'
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaseRoutingModule {}