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
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { TimePipe } from 'src/app/pipes/time.pipe';
import { TableReservation } from 'src/app/models/TableReservation.model';
import { OrderService } from 'src/app/services/Order.Service';
import { Slot } from 'src/app/models/slot.model';

@Component({
  selector: 'app-table-reservation',
  templateUrl: './table-reservation.page.html',
  styleUrls: ['./table-reservation.page.scss'],
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
    IonCardContent,
    IonList,
    IonSegment,
    IonSegmentButton
  ],
})
export class TableReservationPage implements OnInit {
  public tableReservations: TableReservation[] | null = null;
  public _selectedSlot: Slot | null = null;
  slots: Slot[] = [];
  selectedSlotId: number | null = null;
  filteredReservations: TableReservation[] = [];

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.init();
  }

  init() {
    this.orderService.getTableReservations().subscribe((reservations) => {
      this.tableReservations = reservations;
      this.applyFilter();
    });
    this.orderService.getSlots().subscribe((slots) => {
      this.slots = slots;
      this._selectedSlot = slots.length > 0 ? slots[0] : null;
      this.selectedSlotId = this._selectedSlot?.id ?? null;
      this.applyFilter();
    });
  }

  onSlotFilterChanged(slotId: number | null) {
    this.selectedSlotId = slotId as any;
    this._selectedSlot = this.slots.find((s) => s.id === this.selectedSlotId) ?? null;
    this.applyFilter();
  }

  applyFilter() {
    const all = this.tableReservations ?? [];
    if (!this.selectedSlotId) {
      this.filteredReservations = all;
      return;
    }

    const slot = this.slots.find((s) => s.id === this.selectedSlotId);
    if (!slot) {
      this.filteredReservations = all;
      return;
    }

    const slotStart = new Date(slot.range_start).getTime();
    const slotEnd = new Date(slot.range_end).getTime();

    this.filteredReservations = all.filter((r) => {
      const rStart = new Date(r.start).getTime();
      const rEnd = new Date(r.end).getTime();
      return rStart >= slotStart && rEnd <= slotEnd;
    });
  }

  formatReservationTime(reservation: TableReservation): string {
    const start = new Date(reservation.start);
    const end = new Date(reservation.end);

    const fmt = (d: Date) => {
      if (isNaN(d.getTime())) return '';
      const h = d.getHours();
      const m = d.getMinutes();
      return m === 0 ? `${h}` : `${h}.${m.toString().padStart(2, '0')}`;
    };

    const s = fmt(start);
    const e = fmt(end);
    return `${s} bis ${e} Uhr`;
  }
}
