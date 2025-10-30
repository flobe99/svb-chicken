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
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { ConfigChicken, Product } from 'src/app/models/product.model';
import { OrderService } from 'src/app/services/Order.Service';
import { Location } from '@angular/common';
import { Slot } from 'src/app/models/slot.model';
import {
  addCircleOutline,
  addOutline,
  ellipsisVerticalOutline,
  trashOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

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
    IonItemDivider,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonCardTitle,
  ],
})
export class SettingsPage implements OnInit {
  public products: Product[] = [];
  public slots: Slot[] = [];
  config: ConfigChicken = {
    id: 0,
    chicken: 0,
    nuggets: 0,
    fries: 0,
  };

  constructor(
    private alertController: AlertController,
    private router: Router,
    private orderService: OrderService,
    private toastController: ToastController,
    private location: Location
  ) {
    addIcons({ trashOutline, addCircleOutline });
  }

  async ngOnInit() {
    this.orderService.getSlots().subscribe((slots) => {
      this.slots = slots;
    });

    this.orderService.getProducts().subscribe((products) => {
      this.products = products;
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

  addSlot() {
    const dateOnly = new Date().toISOString().split('T')[0]; // z. B. "2025-10-12"
    const startTime = '17:00:00';
    const endTime = '20:00:00';

    this.slots.push({
      date: dateOnly,
      range_start: `${dateOnly}T${startTime}`,
      range_end: `${dateOnly}T${endTime}`,
    });
  }

  deleteSlot(slot: Slot) {
    if (slot) {
      this.slots = this.slots.filter((s) => s !== slot);
      this.orderService.deleteSlot(slot.id!).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Slot wurde gelöscht.',
            duration: 2000,
            position: 'top',
            color: 'success',
          });
          await toast.present();
        },
        error: async (err) => {
          const toast = await this.toastController.create({
            message: 'Fehler beim Löschen des Slots',
            duration: 2000,
            position: 'top',
            color: 'danger',
          });
          await toast.present();
          console.error('Delete slot failed:', err);
        },
      });
    }
  }

  extractTime(datetime: string): string {
    const d = new Date(datetime);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  async save() {
    await this.saveSlots();
    await this.saveProduct();
    await this.saveConfig();
  }

  async saveSlots() {
    const results: boolean[] = [];
    console.table(this.slots);

    for (const slot of this.slots) {
      console.table('\n######################');
      const dateOnly = slot.date.split('T')[0]; // z. B. "2025-10-12"
      const startTime = this.extractTime(slot.range_start); // z. B. "17:00:00"
      const endTime = this.extractTime(slot.range_end); // z. B. "20:00:00"

      const payload = {
        date: dateOnly,
        range_start: `${dateOnly}T${startTime}`,
        range_end: `${dateOnly}T${endTime}`,
      };

      try {
        if (slot.id) {
          const res = await firstValueFrom(
            this.orderService.updateSlot(slot.id, payload)
          );
          console.log(`Slot ${slot.id} aktualisiert`, res);
          results.push(true);
        } else {
          const res = await firstValueFrom(
            this.orderService.createSlot(payload)
          );
          console.log('Neuer Slot erstellt', res);
          results.push(true);
        }
      } catch (err) {
        console.error('Fehler beim Speichern des Slots', err);
        results.push(false);
      }
    }

    const allSuccessful = results.every((r) => r === true);

    const toast = await this.toastController.create({
      message: allSuccessful
        ? 'Settings erfolgreich gespeichert.'
        : 'Fehler beim Absenden der Settings.',
      duration: 2500,
      color: allSuccessful ? 'success' : 'danger',
      position: 'top',
    });
    await toast.present();

    if (allSuccessful) {
      this.router.navigate(['/dashboard']);
    }
  }

  async saveProduct() {
    try {
      const updatePromises = this.products.map((product) =>
        firstValueFrom(this.orderService.updateProduct(product))
      );

      const results = await Promise.all(updatePromises);
      console.table(results);
      const allSuccessful = results.every((res) => res.success);
      console.log(allSuccessful);

      const toast = await this.toastController.create({
        message: allSuccessful
          ? 'Settings erfolgreich gespeichert.'
          : 'Fehler beim Absenden der Settings.',
        duration: 2500,
        color: allSuccessful ? 'success' : 'danger',
        position: 'top',
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
        position: 'top',
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
            position: 'top',
          });
          await toast.present();
          this.location.back();
        } else {
          console.warn('Speichern fehlgeschlagen');
        }
      },
      error: (err) => console.error('Fehler beim Speichern:', err),
    });
  }

  cancel() {
    this.location.back();
  }
}
