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
  ToastController,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonItemGroup,
  IonItemDivider,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { ConfigChicken, Product } from 'src/app/models/product.model';
import { OrderService } from 'src/app/services/Order.Service';
import { Location } from '@angular/common';

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
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonItemGroup,
    IonItemDivider
  ],
})

export class SettingsPage implements OnInit {

  public products: Product[] = [];
  config: ConfigChicken = {
    id: 0,
    chicken: 0,
    nuggets: 0,
    fries: 0
  };

  constructor(
    private alertController: AlertController,
    private router: Router,
    private orderService: OrderService,
    private toastController: ToastController,
    private location: Location
  ) {
    console.log('ToastController:', this.toastController);
  }

  async ngOnInit() {
    this.orderService.getProducts().subscribe((data) => {
      this.products = data;
    });

    this.orderService.getConfig().subscribe((config) => {
      this.config = config!;
    });
  }

  formatPrice(product: Product) {
    if (product.price !== null && product.price !== undefined) {
      product.price = parseFloat(product.price.toFixed(2));
    }
  }

  async saveProduct() {
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

  async saveConfig() {
    this.orderService.updateConfig(this.config.id, this.config).subscribe({
      next: async (res) => {
        if (res.success) {
          console.log('Konfiguration gespeichert');
          const toast = await this.toastController.create({
            message: 'Settings erfolgreich gespeichert.',
            duration: 2500,
            color: 'success',
            position: 'top'
          });
          await toast.present();
          this.location.back();
        } else {
          console.warn('Speichern fehlgeschlagen');
        }
      },
      error: (err) => console.error('Fehler beim Speichern:', err)
    });
  }

  cancel() {
    this.location.back();
  }
}
