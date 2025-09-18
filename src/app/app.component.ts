import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fastFood, settings, mail, add, fastFoodOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonListHeader
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonListHeader
  ],
})
export class AppComponent {

  constructor() {
    addIcons({ fastFoodOutline, fastFood, settings, mail, add });
  }

  public appPages = [
    { title: 'Bestellung', url: '/order', icon: 'fast-food-outline' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];
}
