import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonCardHeader, IonContent, IonHeader, IonItem, IonTitle, IonToolbar, IonLabel, IonInput, IonButton, IonButtons, IonMenuButton, IonDatetime, IonTextarea, IonPopover, IonModal, IonDatetimeButton, IonIcon, IonNote, IonCard,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  ActionSheetController,
  AlertController,
  ToastController,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/angular/standalone';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { TimePipe } from 'src/app/pipes/time.pipe';
import { OrderService } from 'src/app/services/Order.Service';
import { OrderChicken } from 'src/app/models/order.model';
import { StorageService } from 'src/app/services/storage.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { createOutline, ellipsisVerticalOutline, close, filter, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-scan-order',
  templateUrl: './scan-order.page.html',
  styleUrls: ['./scan-order.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonDatetime,
    IonTextarea,
    IonPopover,
    IonModal,
    IonDatetimeButton,
    IonIcon,
    RefreshComponent,
    IonNote,
    IonCard,
    TimePipe,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonSelect,
    IonSelectOption,
    IonText
  ],
})
export class ScanOrderPage implements OnInit {

  scanning = false;
  order: OrderChicken | null = null;
  errorMsg = '';
  manualCode = '';

  @ViewChild('selectRefs', { static: false }) selectRefs: any;

  constructor(
    private orderService: OrderService,
    private storageService: StorageService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      filter,
      close,
      ellipsisVerticalOutline,
      createOutline,
      trashOutline,
    });
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.stopScan();
  }

  async startScan() {
    this.errorMsg = '';
    try {
      const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
      const permission = await BarcodeScanner.checkPermission({ force: true });
      if (permission && permission.granted === false) {
        this.errorMsg = 'Kamerazugriff verweigert';
        return;
      }

      this.scanning = true;
      const result = await BarcodeScanner.startScan();
      this.scanning = false;

      if (result && (result as any).hasContent) {
        const content = (result as any).content || (result as any).text || '';
        this.handleScanned(content);
      } else {
        this.errorMsg = 'Kein QR-Code erkannt.';
      }
    } catch (e) {
      console.error('Scan Fehler', e);
      this.errorMsg = 'Scanner nicht verfügbar. Bitte manuell eingeben.';
      this.scanning = false;
    }
  }

  stopScan() {
    this.scanning = false;
    (async () => {
      try {
        const mod = await import('@capacitor-community/barcode-scanner');
        if (mod && (mod as any).BarcodeScanner && (mod as any).BarcodeScanner.stopScan) {
          await (mod as any).BarcodeScanner.stopScan();
        }
      } catch (e) {
        // ignore
      }
    })();
  }

  showManual() {
    if (!this.manualCode || !this.manualCode.trim()) {
      this.errorMsg = 'Bitte Bestell-ID oder QR-Inhalt eingeben.';
      return;
    }
    this.handleScanned(this.manualCode.trim());
  }

  private handleScanned(content: string) {
    const id = this.extractOrderId(content);
    if (!id) {
      this.errorMsg = 'Keine Bestell-ID im QR-Code gefunden.';
      return;
    }
    this.loadOrder(id);
  }

  private extractOrderId(content: string): string | null {
    if (!content) return null;
    // If the QR contains a URL like /order/123 or full URL
    const m = content.match(/\/order\/(\d+)/);
    if (m && m[1]) return m[1];
    // If it's just digits
    const d = content.match(/\d+/);
    return d ? d[0] : null;
  }

  private loadOrder(id: string) {
    this.errorMsg = '';
    this.order = null;
    this.orderService.getOrderById(id).subscribe({
      next: (o) => {
        if (o && (o as any).id) {
          this.order = o;
        } else {
          this.errorMsg = 'Bestellung nicht gefunden.';
        }
      },
      error: (err) => {
        console.error('Error loading order', err);
        this.errorMsg = 'Fehler beim Laden der Bestellung.';
      }
    });
  }

  async openActionSheet(order: OrderChicken) {
    const actionSheet = await this.actionSheetController.create({
      header: `Bestellung #${order.id} ${order.lastname}, ${order.firstname}`,
      buttons: [
        {
          text: 'Bearbeiten',
          icon: 'create-outline',
          handler: () => {
            this.editOrder(order);
          },
        },
        {
          text: 'Löschen',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.deleteOrder(order);
          },
        },
        {
          text: 'Abbrechen',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  editOrder(order: OrderChicken) {
    this.orderService.setEditOrder(order);
    this.router.navigate(['/order'], {
      state: { order },
    });
  }

  async deleteOrder(order: OrderChicken) {
    const alert = await this.alertController.create({
      header: 'Bestellung löschen',
      message: 'Möchtest du die Bestellung wirklich löschen?',
      buttons: [
        {
          text: 'Nein',
          role: 'cancel',
        },
        {
          text: 'Ja',
          handler: () => {
            this.orderService
              .deleteOrderById(order.id!)
              .subscribe(async (response) => {
                if (response.success) {
                  const toast = await this.toastController.create({
                    message: 'Bestellung erfolgreich gelöscht.',
                    duration: 2000,
                    color: 'success',
                    position: 'bottom',
                  });
                  await toast.present();
                }
              });
          },
        },
      ],
    });

    await alert.present();
  }
  openSelect(order: OrderChicken) {
    if (this.selectRefs) {
      try {
        this.selectRefs.value = order.status;
        this.selectRefs.open();
      } catch (e) {
        console.error('Fehler beim Öffnen des Selects', e);
      }
    } else {
      console.warn('selectRefs nicht gefunden');
    }
  }

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

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  onStatusChange(event: any, order: OrderChicken) {
    const newStatus = event.detail.value;
    order.status = newStatus;

    if (order.checked_in_at === '') {
      order.checked_in_at = null as any;
    }

    if (order.id) {
      this.orderService.updateOrder(order.id, order).subscribe((response) => {
        if (response.success) {
          console.log(
            `Status für Bestellung ${order.id} erfolgreich aktualisiert: ${newStatus}`
          );
        } else {
          console.error(
            `Fehler beim Aktualisieren von Bestellung ${order.id}`,
            response.error
          );
        }
      });
    }
    // this.applyFilter();
  }
}
