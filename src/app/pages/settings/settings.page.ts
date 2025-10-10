import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  ModalController,
  IonRefresher,
  IonRefresherContent,
  AlertController,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  ToastController
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { Product } from 'src/app/models/product.model';
import { OrderService } from 'src/app/services/Order.Service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    IonIcon,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
  ],
})

export class SettingsPage implements OnInit {

  public products: Product[] = [];

  constructor(
    private alertController: AlertController,
    private router: Router,
    private orderService: OrderService,
    private toastController: ToastController
  ) {
    console.log('ToastController:', this.toastController);
  }

  async ngOnInit() {
    this.orderService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }

  formatPrice(product: Product) {
    if (product.price !== null && product.price !== undefined) {
      product.price = parseFloat(product.price.toFixed(2));
    }
  }

  async save() {
    try {
      const updatePromises = this.products.map(product =>
        firstValueFrom(this.orderService.updateProduct(product))
      );

      const results = await Promise.all(updatePromises);
      console.table(results)
      const allSuccessful = results.every(res => res.success);
      console.log(allSuccessful)

      const toast = await this.toastController.create({
        message: allSuccessful
          ? 'Settings erfolgreich gespeichert.'
          : 'Fehler beim Absenden der Settings.',
        duration: 2500,
        color: allSuccessful ? 'success' : 'danger',
        position: 'top'
      });
      await toast.present();

      if (allSuccessful) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      const toast = await this.toastController.create({
        message: 'Fehler beim Absenden der Settings.',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  cancel() {
    this.router.navigate(['/order'])
  }
}
