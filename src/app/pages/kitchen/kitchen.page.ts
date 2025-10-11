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
  IonRow
} from '@ionic/angular/standalone'
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { TimePipe } from 'src/app/pipes/time.pipe';
import { OrderChicken, OrderSummaryResponse, OrderSummarySlot } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/Order.Service';

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

  ]
})

export class KitchenPage implements OnInit {
  timeSlots: TimeSlotConfig[] = [];

  constructor(private orderService: OrderService) { }

  async ngOnInit() {
    const configs: { label: string; date: string; range: string }[] = [
      { label: 'Samstag – 17:00 bis 20:00', date: '2025-10-11', range: '17:00-20:00' },
      { label: 'Sonntag – 10:30 bis 13:30', date: '2025-10-12', range: '10:30-13:30' },
      { label: 'Sonntag – 17:00 bis 20:00', date: '2025-10-12', range: '17:00-20:00' }
    ];

    // Initialisiere leeres Array mit Platzhaltern
    this.timeSlots = configs.map(() => ({
      label: '',
      date: '',
      range: '',
      slots: [],
      total: { chicken: 0, nuggets: 0, fries: 0 }
    }));

    configs.forEach((config, index) => {
      this.orderService.getOrderSummary(config.date, config.range).subscribe(summary => {
        this.timeSlots[index] = {
          label: config.label,
          date: config.date,
          range: config.range,
          slots: summary.slots.map(s => new OrderSummarySlot(s)),
          total: {
            chicken: summary.total.chicken,
            nuggets: summary.total.nuggets,
            fries: summary.total.fries
          }
        };
      });
    });

    await this.orderService.connectToOrderWebSocket(() => {
      configs.forEach((config, index) => {
        this.orderService.getOrderSummary(config.date, config.range).subscribe(summary => {
          this.timeSlots[index] = {
            label: config.label,
            date: config.date,
            range: config.range,
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
  }

  async init() {

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