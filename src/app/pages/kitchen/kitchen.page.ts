import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonActionSheet,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonAccordion,
  IonAccordionGroup,
  IonGrid,
  IonCol,
  IonRow,
  IonText,
} from '@ionic/angular/standalone';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { TimePipe } from 'src/app/pipes/time.pipe';
import {
  OrderChicken,
  OrderSummaryResponse,
  OrderSummarySlot,
} from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/Order.Service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { ConfigChicken } from 'src/app/models/product.model';
import { Slot } from 'src/app/models/slot.model';
import { TimeSlotConfig } from 'src/app/models/TimeSlotConfig.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-kitchen',
  templateUrl: './kitchen.page.html',
  styleUrls: ['./kitchen.page.scss'],
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    RefreshComponent,
    IonList,
    IonActionSheet,
    IonChip,
    IonSelect,
    IonSelectOption,
    IonAccordion,
    IonAccordionGroup,
    TimePipe,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
  ],
})
export class KitchenPage implements OnInit {
  timeSlots: TimeSlotConfig[] = [];
  config: ConfigChicken = new ConfigChicken();
  slots: Slot[] = [];

  totalChicken: number = 0;
  totalNuggets: number = 0;
  totalFries: number = 0;


  constructor(
    private orderService: OrderService,
    private router: Router,
    private storageService: StorageService,
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  async init() {
    // Lade Slot-Konfigurationen dynamisch vom Backend
    this.orderService.getSlots().subscribe((slots) => {
      this.slots = slots;
      // Initialisiere Platzhalter für jedes Slot-Objekt
      this.timeSlots = slots.map(() => ({
        date: '',
        range_start: '',
        range_end: '',
        slots: [],
        total: { chicken: 0, nuggets: 0, fries: 0 },
      }));

      const _timepipe = new TimePipe();

      slots.forEach((slot, index) => {
        this.orderService
          .getOrderSummary(
            slot.date,
            _timepipe.get(slot.range_start, 'time') +
            '-' +
            _timepipe.get(slot.range_end, 'time')
          )
          .subscribe((summary) => {
            this.timeSlots[index] = {
              date: slot.date,
              range_start: slot.range_start,
              range_end: slot.range_end,
              slots: summary.slots.map((s) => new OrderSummarySlot(s)),
              total: {
                chicken: summary.total.chicken,
                nuggets: summary.total.nuggets,
                fries: summary.total.fries,
              },
            };
            this.totalChicken = this.timeSlots.reduce((sum, slot) => sum + slot.total.chicken, 0);
            this.totalNuggets = this.timeSlots.reduce((sum, slot) => sum + slot.total.nuggets, 0);
            this.totalFries = this.timeSlots.reduce((sum, slot) => sum + slot.total.fries, 0);
          });
      });

      // Konfiguration laden
      this.orderService.getConfig().subscribe((config) => {
        if (config) {
          this.config = config;
        }
      });

      // WebSocket verbinden und bei Änderungen aktualisieren
      this.orderService.connectToOrderWebSocket(() => {
        slots.forEach((slot, index) => {
          const range = this.formatRange(slot.range_start, slot.range_end);
          this.orderService
            .getOrderSummary(slot.date, range)
            .subscribe((summary) => {
              this.timeSlots[index] = {
                date: slot.date,
                range_start: slot.range_start,
                range_end: slot.range_end,
                slots: summary.slots.map((s) => new OrderSummarySlot(s)),
                total: {
                  chicken: summary.total.chicken,
                  nuggets: summary.total.nuggets,
                  fries: summary.total.fries,
                },
              };
            });
        });
      });
    });
  }

  async openContextMenu(event: MouseEvent, date: string, time: string) {
    event.preventDefault();

    const datetime = `${date}T${time}`
    const _pipe = new TimePipe();

    const alert = await this.alertController.create({
      header: 'Neue Bestellung',
      subHeader: _pipe.get(datetime, "plain"),
      message: 'Möchtest du eine neue Bestellung für diesen Zeitpunkt erstellen?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
        },
        {
          text: 'Bestellen',
          handler: () => {
            this.router.navigate(['/order'], {
              state: {
                date: datetime
              }
            });
          },
        },
      ],
    });

    await alert.present();
  }



  formatRange(start: string, end: string): string {
    const startTime = new Date(start).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date(end).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${startTime}-${endTime}`;
  }

  getCurrentTimeIndex(slot: OrderSummarySlot[], slotDate: string): number {
    const now = new Date();
    // const now = new Date('2025-10-11T19:59:00');

    return slot.findIndex((s) => {
      const start = new Date(`${slotDate}T${s.time}`);
      const end = new Date(start.getTime() + 15 * 60 * 1000);

      return now >= start && now < end;
    });
  }

  async goToTheke(date: string, time: string) {
    const filter = {
      // date: date.slice(0, 10)
      date: date + time,
    };
    await this.storageService.set('orderFilter', { date: date + 'T' + time });
    this.router.navigate(['/theke'], {
      state: { filter },
    });
  }
}
