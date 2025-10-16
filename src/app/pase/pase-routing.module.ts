import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PaseHomePageComponent } from "./pages/pase-home-page/pase-home-page.component";
import { PaseLayoutComponent } from "./pase-layout/pase-layout.component";

const routes: Routes = [
    { path: '', component: PaseLayoutComponent, children: [
        { path: '', component: PaseHomePageComponent , pathMatch: 'full'}
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaseRoutingModule {}