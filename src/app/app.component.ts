import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fastFood, settings, mail, add, fastFoodOutline, homeOutline, addCircle, addCircleOutline } from 'ionicons/icons';
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
  IonListHeader,
  ToastController,
  IonButton
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
    IonListHeader,
    IonButton
  ],
})
export class AppComponent {

  constructor(private toastController: ToastController) {
    addIcons({ fastFoodOutline, fastFood, settings, mail, add, homeOutline, addCircleOutline });
  }

  async showToast() {
    const toast = await this.toastController.create({
      message: 'Hallo von Ionic!',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  public appPages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home-outline' },
    { title: 'Bestellung', url: '/order', icon: 'fast-food-outline' },
    { title: 'Theke', url: '/theke', icon: 'add-circle-outline' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];
}
