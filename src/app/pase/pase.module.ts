import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PaseLayoutComponent } from "./pase-layout/pase-layout.component";
import { PaseRoutingModule } from "./pase-routing.module";

@NgModule({
  imports: [
    CommonModule,
    PaseLayoutComponent,
    PaseRoutingModule
    ],
})
export class PaseModule {}