import { Component } from '@angular/core';
import {
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { beer, settings } from 'ionicons/icons';
import { filter } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    RouterModule,
  ],
})
export class MenuComponent {
  public selectedPath = '';

  public appPages = [
    {
      title: 'Mixen',
      url: '/mix',
      icon: beer,
    },
    {
      title: 'Mixen',
      url: '/mix',
      icon: beer,
    },
    // {
    //   title: 'Settings',
    //   url: '/settings',
    //   icon: settings,
    // },
  ];

  public email = 'hi@ionicframework.com';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.selectedPath = event.urlAfterRedirects;
      });
  }
}
