import { Component } from '@angular/core';
import { HomeNavComponent } from '../../components/home-nav/home-nav.component';
import { HomeFooterComponent } from '../../components/home-footer/home-footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [
    HomeNavComponent,
    HomeFooterComponent,
    RouterLink
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

  ScrollPage: any = 0;

  constructor(){
    this.ScrollPage = 0;
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll(event: any) {
    this.ScrollPage = window.scrollY;
  }

}
