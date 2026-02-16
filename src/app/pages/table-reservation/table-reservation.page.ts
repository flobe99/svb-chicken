import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  IonSegmentButton,
  IonAccordionGroup,
  IonAccordion,
  IonCol,
  IonRow,
  IonGrid,
  ModalController
} from '@ionic/angular/standalone';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { TimePipe } from 'src/app/pipes/time.pipe';
import { TableReservation } from 'src/app/models/TableReservation.model';
import { OrderService } from 'src/app/services/Order.Service';
import { Slot } from 'src/app/models/slot.model';
import { addIcons } from 'ionicons';
import { pencil, pencilOutline, pencilSharp } from 'ionicons/icons';
import { Table } from 'src/app/models/Table.model';
import { ReservationDetailsModal } from 'src/app/modals/reservation-details.modal';

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
    IonSegmentButton,
    IonAccordionGroup,
    IonAccordion,
    IonCol,
    IonRow,
    IonGrid
  ],
})
export class TableReservationPage implements OnInit {
  public tableReservations: TableReservation[] | null = null;
  public _selectedSlot: Slot | null = null;
  slots: Slot[] = [];
  selectedSlotId: number | null = null;
  filteredReservations: TableReservation[] = [];
  tablesByName: Map<string, TableReservation[]> = new Map();
  tables: Table[] = [];

  constructor(private orderService: OrderService, private router: Router, private modalCtrl: ModalController) { 
    addIcons({ pencil, pencilOutline, pencilSharp });
  }

  ngOnInit() {
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  init() {
    this.orderService.getTables().subscribe((tables) => {
      this.tables = tables ?? [];
      this.groupReservationsByTable();
    });

    this.orderService.getTableReservations().subscribe((reservations) => {
      this.tableReservations = reservations;
      this.applyFilter();
    });
    this.orderService.getSlots().subscribe((slots) => {
      this.slots = slots;
      this._selectedSlot = slots.length > 0 ? slots[0] : null;
      this.selectedSlotId = this._selectedSlot?.id ?? null;
      if (this._selectedSlot) {
        this.generateIntervalsForSlot(this._selectedSlot);
      }
      this.applyFilter();
    });
  }

onSlotFilterChanged(slotId: number | null) {
  this.selectedSlotId = slotId as any;
  this._selectedSlot = this.slots.find((s) => s.id === this.selectedSlotId) ?? null;

  if (this._selectedSlot) {
    this.generateIntervalsForSlot(this._selectedSlot);
  }

  this.applyFilter();
}


  applyFilter() {
    const all = this.tableReservations ?? [];
    if (!this.selectedSlotId) {
      this.filteredReservations = all;
      this.groupReservationsByTable();
      return;
    }

    const slot = this.slots.find((s) => s.id === this.selectedSlotId);
    if (!slot) {
      this.filteredReservations = all;
      this.groupReservationsByTable();
      return;
    }

    const slotStart = new Date(slot.range_start).getTime();
    const slotEnd = new Date(slot.range_end).getTime();

    this.filteredReservations = all.filter((r) => {
      const rStart = new Date(r.start).getTime();
      const rEnd = new Date(r.end).getTime();
      return rStart >= slotStart && rEnd <= slotEnd;
    });
    this.groupReservationsByTable();
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

  groupReservationsByTable() {
    this.tablesByName.clear();

    this.tables.forEach(table => {
      this.tablesByName.set(table.name, []);
    });

    this.filteredReservations.forEach((reservation) => {
      const tableName = reservation.table?.name || 'Unbekannt';

      if (!this.tablesByName.has(tableName)) {
        this.tablesByName.set(tableName, []);
      }

      this.tablesByName.get(tableName)?.push(reservation);
    });
  }

  getTableNames(): string[] {
    return Array.from(this.tablesByName.keys()).sort();
  }

  navigateToAddReservation() {
    this.router.navigate(['/add-reservation']);
  }

  editReservation(reservation: TableReservation) {
    this.router.navigate(['/add-reservation', reservation.id]);
  }

intervals: string[] = []; // z. B. ["18:00", "18:15", "18:30", ...]

generateIntervalsForSlot(slot: Slot) {
  this.intervals = [];

  const start = new Date(slot.range_start);
  const end = new Date(slot.range_end);

  let current = new Date(start);

  while (current <= end) {
    this.intervals.push(
      current.toTimeString().substring(0, 5)
    );
    current = new Date(current.getTime() + 15 * 60000);
  }
}


  isReserved(tableName: string, interval: string): boolean {
    const reservations = this.tablesByName.get(tableName) || [];
    if (!this._selectedSlot) return false;

    const slotDate = new Date(this._selectedSlot.date);
    const [h, m] = interval.split(':').map(Number);

    const intervalStart = new Date(slotDate);
    intervalStart.setHours(h, m, 0, 0);

    const intervalEnd = new Date(intervalStart.getTime() + 15 * 60000);

    return reservations.some(r => {
      const rStart = new Date(r.start);
      const rEnd = new Date(r.end);

      return rStart < intervalEnd && rEnd > intervalStart;
    });
  }

  getReservation(tableName: string, interval: string): TableReservation | null {
    const reservations = this.tablesByName.get(tableName) || [];
    if (!this._selectedSlot) return null;

    const slotDate = new Date(this._selectedSlot.date);
    const [h, m] = interval.split(':').map(Number);

    const intervalStart = new Date(slotDate);
    intervalStart.setHours(h, m, 0, 0);

    const intervalEnd = new Date(intervalStart.getTime() + 15 * 60000);

    return reservations.find(r => {
      const rStart = new Date(r.start);
      const rEnd = new Date(r.end);
      return rStart < intervalEnd && rEnd > intervalStart;
    }) || null;
  }

  async openReservationModal(reservation: TableReservation) {
    const modal = await this.modalCtrl.create({
      component: ReservationDetailsModal,
      componentProps: {
        reservation: reservation
      }
    });

    await modal.present();
  }

  onCellClick(tableName: string, interval: string) {
    const reservation = this.getReservation(tableName, interval);

    if (!reservation) {
      console.log("Frei – neue Reservierung möglich");
      return;
    }

    this.openReservationModal(reservation);
  }


}
