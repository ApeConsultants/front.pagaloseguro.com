import { NgModule } from "@angular/core";
import { HomeLayoutComponent } from "./home-layout/home-layout.component";
import { CommonModule } from "@angular/common";
import { HomeRoutingModule } from "./home-routing.module";

@NgModule({
  imports: [
    HomeLayoutComponent,
    CommonModule,
    HomeRoutingModule
    ],
})
export class HomeModule {}