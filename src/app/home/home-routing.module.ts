import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeLayoutComponent } from "./home-layout/home-layout.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { LoginPageComponent } from "./pages/login-page/login-page.component";

const routes: Routes = [
    { path: '', component: HomeLayoutComponent, children: [
        { path: '', component: HomePageComponent, pathMatch: 'full'},
        { path: 'login', component: LoginPageComponent, pathMatch: 'full'},
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}