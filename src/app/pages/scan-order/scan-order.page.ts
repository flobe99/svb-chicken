import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
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

import { BrowserQRCodeReader, IScannerControls} from '@zxing/browser';
import { Result} from '@zxing/library';
import { OrderComponent } from 'src/app/components/order/order.component';

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
    IonText,
    OrderComponent 
  ],
})
export class ScanOrderPage implements OnInit, OnDestroy {

  scanning = false;
  order: OrderChicken | null = null;
  errorMsg = '';
  manualCode = '';

  @ViewChild('videoEl', { static: false }) videoEl!: ElementRef<HTMLVideoElement>;
  private reader = new BrowserQRCodeReader();
  private controls?: IScannerControls;
  cameras: MediaDeviceInfo[] = [];
  selectedDeviceId: string | null = null;

  @ViewChild('selectRefs', { static: false }) selectRefs: any;

  constructor(
    private orderService: OrderService,
    private storageService: StorageService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private ngZone: NgZone,
  ) {
    addIcons({
      filter,
      close,
      ellipsisVerticalOutline,
      createOutline,
      trashOutline,
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.teardown();
  }

  async startScan() {
    this.errorMsg = '';
    this.order = null;

    try {
      // Permission
      const tmp = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      tmp.getTracks().forEach(t => t.stop());

      // 2) list all available cameras
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
      if (!devices.length) {
        this.errorMsg = 'Keine Kamera gefunden.';
        return;
      }
      this.cameras = devices;

      // default camera 
      const back = devices.find(d => /back|rear|environment/i.test(d.label));
      this.selectedDeviceId = back?.deviceId ?? devices[0].deviceId;

      // start scan
      await this.beginDecodeWithDevice(this.selectedDeviceId);

      document.addEventListener('visibilitychange', this.handleVisibility, { passive: true });
      window.addEventListener('pagehide', this.cleanup, { passive: true });
    } catch (e: any) {
      console.error('Scan-Start fehlgeschlagen', e);
      this.errorMsg = e?.message ?? 'Kamera konnte nicht geöffnet werden.';
      this.scanning = false;
    }
  }

  private async beginDecodeWithDevice(deviceId: string | null) {
    if (!deviceId) {
      throw new Error('Keine Kamera-ID verfügbar.');
    }

    const video = this.videoEl?.nativeElement;
    if (!video) {
      throw new Error('Videoelement nicht gefunden.');
    }

    video.setAttribute('playsinline', 'true');
    video.setAttribute('muted', 'true');

    this.scanning = true;

    const ctrlOrVoid = await this.reader.decodeFromVideoDevice(
      deviceId,
      video,
      (result: Result | undefined, err: unknown, controls: IScannerControls) => {
        if (!this.controls) {
          this.controls = controls;
        }

        if (result) {
          this.ngZone.run(() => {
            const text = result.getText();
            this.onDetected(text);
          });
        }
      }
    );

    if (ctrlOrVoid && typeof (ctrlOrVoid as any).stop === 'function') {
      this.controls = ctrlOrVoid as IScannerControls;
    }
  }

  onCameraChange(event: any) {
    const id = event.detail?.value as string;
    if (!id) return;
    this.switchCamera(id);
  }

  private async switchCamera(deviceId: string) {
    try {
      this.stopScan(false);
      await this.beginDecodeWithDevice(deviceId);
      this.selectedDeviceId = deviceId;
      this.scanning = true;
    } catch (e: any) {
      console.error('Kamerawechsel fehlgeschlagen', e);
      this.errorMsg = e?.message ?? 'Kamerawechsel fehlgeschlagen.';
    }
  }

  stopScan(hideMsg = true) {
    if (hideMsg) this.errorMsg = '';
    if (this.controls) {
      this.controls.stop();
      this.controls = undefined;
    }
    this.scanning = false;
  }

  private handleVisibility = () => {
    if (document.hidden) {
      this.stopScan();
    }
  };

  private cleanup = () => {
    this.stopScan();
  };

  private teardown() {
    document.removeEventListener('visibilitychange', this.handleVisibility);
    window.removeEventListener('pagehide', this.cleanup);
    this.stopScan();
  }

  private onDetected(content: string) {
    this.stopScan(false);
    this.handleScanned(content);
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
    const m = content.match(/\/order\/(\d+)/i);
    if (m && m[1]) return m[1];
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
          this.manualCode = this.order.id.toString();
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
  }
}