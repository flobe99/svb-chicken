import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonLabel, IonText, IonSelect, IonSelectOption, IonButton, IonIcon,
  ActionSheetController, ToastController, AlertController
} from '@ionic/angular/standalone';

import { OrderChicken } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/Order.Service';
import { Router } from '@angular/router';
import { TimePipe } from 'src/app/pipes/time.pipe';

@Component({
  selector: 'app-order-view',
  templateUrl: './order.component.html',
  standalone: true,
  imports: [
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonItem, IonLabel, IonText, IonSelect, IonSelectOption,
    IonButton, IonIcon, TimePipe
  ]
})
export class OrderComponent implements OnInit{

  @Input() order!: OrderChicken;
  @ViewChild('selectRefs', { static: false }) selectRefs: any;

  statusLabels: { [key: string]: string } = {
    CREATED: 'Erstellt',
    CHECKED_IN: 'DriveIn',
    READY_FOR_PICKUP: 'Abholbereit',
    COMPLETED: 'Fertig',
    CANCELLED: 'Storniert',
    PAID: 'Bezahlt',
    PRINTED: 'Gedruckt',
    PREPARING: 'In Vorbereitung',
  };

  constructor(
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private orderService: OrderService
  ) {}
  ngOnInit() {
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  async openActionSheet(order: OrderChicken) {
    const sheet = await this.actionSheetController.create({
      header: `Bestellung #${order.id} ${order.lastname}, ${order.firstname}`,
      buttons: [
        {
          text: 'Bearbeiten',
          icon: 'create-outline',
          handler: () => this.editOrder(order),
        },
        {
          text: 'Löschen',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.deleteOrder(order),
        },
        { text: 'Abbrechen', icon: 'close', role: 'cancel' }
      ],
    });
    await sheet.present();
  }

  openSelect(order: OrderChicken) {
    this.selectRefs?.open();
  }

  editOrder(order: OrderChicken) {
    this.orderService.setEditOrder(order);
    this.router.navigate(['/order'], { state: { order } });
  }

  async deleteOrder(order: OrderChicken) {
    const alert = await this.alertController.create({
      header: 'Bestellung löschen',
      message: 'Möchtest du die Bestellung wirklich löschen?',
      buttons: [
        { text: 'Nein', role: 'cancel' },
        {
          text: 'Ja',
          handler: async () => {
            const response = await this.orderService.deleteOrderById(order.id!).toPromise();
            if (response?.success) {
              const toast = await this.toastController.create({
                message: 'Bestellung erfolgreich gelöscht.',
                duration: 2000,
                color: 'success',
                position: 'bottom',
              });
              toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  onStatusChange(event: any, order: OrderChicken) {
    const newStatus = event.detail.value;
    order.status = newStatus;

    if (order.checked_in_at === '') {
      order.checked_in_at = null as any;
    }

    this.orderService.updateOrder(order.id!, order).subscribe();
  }
}