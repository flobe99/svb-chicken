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
  // Web fallback scanner state
  private videoStream: MediaStream | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private scanActive = false;
  private _webScanRaf: number | null = null;

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
      // Some plugin versions require hiding the webview background so the
      // native camera preview becomes visible. Try to prepare and hide background.
      try {
        if ((BarcodeScanner as any).prepare) {
          await (BarcodeScanner as any).prepare();
        }
        if ((BarcodeScanner as any).hideBackground) {
          await (BarcodeScanner as any).hideBackground();
        }
      } catch (e) {
        console.debug('hideBackground/prepare not available or failed', e);
      }

      let result: any = null;
      try {
        result = await BarcodeScanner.startScan();
      } catch (e) {
        // Plugin failed at runtime (e.g. running in browser) -> fallback to web scanner
        console.debug('Capacitor scanner start failed, falling back to web scanner', e);
        await this.startWebScan();
        return;
      }
      this.scanning = false;

      if (result && (result as any).hasContent) {
        const content = (result as any).content || (result as any).text || '';
        this.handleScanned(content);
      } else {
        this.errorMsg = 'Kein QR-Code erkannt.';
      }
    } catch (e) {
      console.error('Scan Fehler (plugin import)', e);
      // If plugin import fails (missing in package.json), fall back to web scanner
      try {
        await this.startWebScan();
      } catch (we) {
        console.error('Web scanner start failed', we);
        this.errorMsg = 'Scanner nicht verfügbar. Bitte manuell eingeben.';
        this.scanning = false;
      }
    }
  }

  stopScan() {
    this.scanning = false;
    (async () => {
      try {
        const mod = await import('@capacitor-community/barcode-scanner');
        if (mod && (mod as any).BarcodeScanner && (mod as any).BarcodeScanner.stopScan) {
          await (mod as any).BarcodeScanner.stopScan();
          if ((mod as any).BarcodeScanner.showBackground) {
            try { await (mod as any).BarcodeScanner.showBackground(); } catch { /* ignore */ }
          }
        }
      } catch (e) {
        // ignore
      }
    })();
    // also stop web fallback if running
    this.stopWebScan();
  }

  private async startWebScan() {
    if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia not supported');
    }

    this.errorMsg = '';
    this.scanning = true;
    const container = document.getElementById('scanner');
    if (!container) throw new Error('Scanner container not found');

    // create video element
    const video = document.createElement('video');
    video.setAttribute('playsinline', 'true');
    video.style.width = '100%';
    video.style.height = 'auto';
    container.innerHTML = '';
    container.appendChild(video);

    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    this.videoStream = stream;
    video.srcObject = stream;
    await video.play();

    // create canvas for scanning
    const canvas = document.createElement('canvas');
    this.canvasEl = canvas;
    this.canvasCtx = canvas.getContext('2d');
    this.scanActive = true;

    const jsqrMod = await import('jsqr');
    const jsQR = (jsqrMod && (jsqrMod as any).default) || jsqrMod;

    const tick = async () => {
      if (!this.scanActive) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        this.canvasCtx!.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = this.canvasCtx!.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          this.scanActive = false;
          this.stopWebScan();
          this.handleScanned(code.data);
          return;
        }
      }
      this._webScanRaf = requestAnimationFrame(tick);
    };

    tick();
  }

  private stopWebScan() {
    this.scanActive = false;
    if (this._webScanRaf) {
      cancelAnimationFrame(this._webScanRaf);
      this._webScanRaf = null;
    }
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(t => t.stop());
      this.videoStream = null;
    }
    if (this.canvasEl && this.canvasEl.parentElement) {
      // leave canvas removed
      this.canvasEl.remove();
      this.canvasEl = null;
      this.canvasCtx = null;
    }
    const container = document.getElementById('scanner');
    if (container) container.innerHTML = '';
    this.scanning = false;
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
