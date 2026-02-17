import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fastFood, settings, mail, add, fastFoodOutline, homeOutline, addCircle, addCircleOutline, restaurantOutline, tabletPortraitOutline, bookmarkOutline, qrCodeOutline } from 'ionicons/icons';
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
import { AuthService } from './services/auth.service';
import { AlertController, MenuController } from '@ionic/angular';

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
  public isLoggedin: boolean = false;

  constructor(
    private toastController: ToastController,
    private authService: AuthService,
    private alertController: AlertController,
    private menuController: MenuController
  ) {
    let href = window.location.href.replace("://", "");
    if (href.indexOf("/") > 0) {
      this.authService.setJumpBackUrl(href.substring(href.indexOf("/")));
    }

    this.authService.getAccountLogin().subscribe(account => {
      this.isLoggedin = account !== null && account.access_token !== '';
    });
    addIcons({
      fastFoodOutline,
      fastFood,
      settings,
      mail,
      add,
      homeOutline,
      addCircleOutline,
      restaurantOutline,
      bookmarkOutline,
      qrCodeOutline
    });
  }

  public appPages_login = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home-outline' },
    { title: 'Bestellung', url: '/order', icon: 'fast-food-outline' },
    { title: 'Tisch-Reservierung', url: '/table-reservation', icon: 'bookmark-outline' },
    { title: 'Theke', url: '/theke', icon: 'add-circle-outline' },
    { title: 'Küche', url: '/kitchen', icon: 'restaurant-outline' },
    { title: 'QR', url: '/scan-order', icon: 'qr-code-outline' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];

  public appPages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home-outline' },
    { title: 'Bestellung', url: '/order', icon: 'fast-food-outline' },
  ];

  get pagesToShow() {
    return this.isLoggedin ? this.appPages_login : this.appPages;
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Möchtest du dich ausloggen?',
      buttons: [
        {
          text: 'Nein',
          role: 'cancel',
        },
        {
          text: 'Ja',
          handler: () => {
            this.authService.logout()
          },
        },
      ],
    });
    await alert.present();
    this.closeMenu()
  }

  closeMenu() {
    this.menuController.close();
  }
}
