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
  IonText
} from '@ionic/angular/standalone'
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { TimePipe } from 'src/app/pipes/time.pipe';
import { OrderChicken, OrderSummaryResponse, OrderSummarySlot } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/Order.Service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { ConfigChicken } from 'src/app/models/product.model';
import { Slot } from 'src/app/models/slot.model';

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
    IonText
  ]
})

export class KitchenPage implements OnInit {
  timeSlots: TimeSlotConfig[] = [];
  config: ConfigChicken = new ConfigChicken();
  slots: Slot[] = [];

  constructor(private orderService: OrderService, private router: Router, private storageService: StorageService) { }

  async ngOnInit() {
    this.init()
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
        label: '',
        date: '',
        range: '',
        slots: [],
        total: { chicken: 0, nuggets: 0, fries: 0 }
      }));

      slots.forEach((slot, index) => {
        const range = this.formatRange(slot.range_start, slot.range_end);
        this.orderService.getOrderSummary(slot.date, range).subscribe(summary => {
          this.timeSlots[index] = {
            label: slot.label,
            date: slot.date,
            range: range,
            slots: summary.slots.map(s => new OrderSummarySlot(s)),
            total: {
              chicken: summary.total.chicken,
              nuggets: summary.total.nuggets,
              fries: summary.total.fries
            }
          };
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
          this.orderService.getOrderSummary(slot.date, range).subscribe(summary => {
            this.timeSlots[index] = {
              label: slot.label,
              date: slot.date,
              range: range,
              slots: summary.slots.map(s => new OrderSummarySlot(s)),
              total: {
                chicken: summary.total.chicken,
                nuggets: summary.total.nuggets,
                fries: summary.total.fries
              }
            };
          });
        });
      });
    });
  }

  formatRange(start: string, end: string): string {
    const startTime = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime}-${endTime}`;
  }



  async goToTheke(date: string, time: string) {
    console.log(date)
    console.log(time)
    const filter = {
      // date: date.slice(0, 10)
      date: date + time
    };
    await this.storageService.set('orderFilter', { date: date + "T" + time });
    this.router.navigate(['/theke'], {
      state: { filter }
    });
  }
}

interface TimeSlotConfig {
  label: string;
  date: string;
  range: string;
  slots: OrderSummarySlot[];
  total: {
    chicken: number;
    nuggets: number;
    fries: number;
  };
}