import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonModal,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { BackComponent } from 'src/app/components/back/back.component';
import { ReservationDetailsModal } from 'src/app/modals/reservation-details.modal';
import { Slot } from 'src/app/models/slot.model';
import { Table } from 'src/app/models/Table.model';
import { TableReservation } from 'src/app/models/TableReservation.model';
import { OrderService } from 'src/app/services/Order.Service';

@Component({
  selector: 'app-add-reservation',
  templateUrl: './add-reservation.page.html',
  styleUrls: ['./add-reservation.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonButton,
    CommonModule,
    FormsModule,
    BackComponent,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class AddReservationPage implements OnInit {
  customerName: string = '';
  seats: number | null = null;
  date: string = '';
  startTime: string = '';
  endTime: string = '';
  selectedTable: number | null = null;
  tables: Table[] = [];
  slots: Slot[] = [];
  reservationId: number | null = null;
  isEditMode: boolean = false;
  tableReservations: TableReservation[] = [];
  //////////////////////////////
  tablesByName: Map<string, TableReservation[]> = new Map();
  public _selectedSlot: Slot | null = null;
  filteredReservations: TableReservation[] = [];
  selectedSlotId: number | null = null;

  constructor(
    private orderService: OrderService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.reservationId = parseInt(params['id']);
        this.isEditMode = true;
        this.loadReservationData();
      }
    });
    this.loadTables();
    this.loadSlots();
    this.loadReservations();
    if(!this.isEditMode)
    {
      this.setDefaultTimes();
    }
    this.init()
  }

  init() {
    this.orderService.getTables().subscribe((tables) => {
      this.tables = tables ?? [];
      this.groupReservationsByTable();
    });

    this.orderService.getTableReservations().subscribe((reservations) => {
      this.tableReservations = reservations!;
      this.applyFilter();
    });
    this.orderService.getSlots().subscribe((slots) => {
      this.slots = slots;
      if(!this.selectedSlotId){
        this._selectedSlot = slots.length > 0 ? slots[0] : null;
        this.selectedSlotId = this._selectedSlot?.id ?? null;
      }
      else{
        this._selectedSlot = slots.find((s) => s.id === this.selectedSlotId) ?? null;
      }

      if (this._selectedSlot) {
        this.generateIntervalsForSlot(this._selectedSlot);
      }
      this.applyFilter();
    });
  }

  private setDefaultTimes() {
    this.date = this.roundToNextQuarterHour(new Date());
    this.startTime = this.roundToNextQuarterHour(new Date());
    this.endTime = this.roundToNextQuarterHour(new Date(Date.now() + 60 * 60 * 1000));
  }

  roundToNextQuarterHour(date: Date): string {
    const local = new Date(date.getTime());
    const minutes = local.getMinutes();
    const remainder = 15 - (minutes % 15);

    local.setMinutes(minutes + remainder);
    local.setSeconds(0);
    local.setMilliseconds(0);

    const tzOffset = local.getTimezoneOffset() * 60000;
    const localTime = new Date(local.getTime() - tzOffset);
    return localTime.toISOString().slice(0, 16);
  }

  loadReservationData() {
    if (!this.reservationId) return;

    this.orderService.getTableReservations().subscribe(
      (reservations) => {
        this.tableReservations = reservations || [];
        const reservation = reservations?.find(r => r.id === this.reservationId);
        if (reservation) {
          this.customerName = reservation.customer_name;
          this.seats = reservation.seats;
          this.date = reservation.start.split('T')[0];
          this.startTime = reservation.start;
          this.endTime = reservation.end;
          this.selectedTable = reservation.table?.id || null;
        } else {
          this.showToast('Reservierung nicht gefunden');
        }
      },
      (error) => {
        this.showToast('Fehler beim Laden der Reservierung');
      }
    );
  }

  loadSlots() {
    this.orderService.getSlots().subscribe(
      (slots) => {
        this.slots = slots || [];
      },
      (error) => {
        this.showToast('Fehler beim Laden der Zeitfenster');
      }
    );
  }

  loadTables() {
    this.orderService.getTables().subscribe(
      (tables) => {
        this.tables = tables || [];
      },
      (error) => {
        this.showToast('Fehler beim Laden der Tische');
      }
    );
  }

  loadReservations() {
    this.orderService.getTableReservations().subscribe(
      (reservations) => {
        this.tableReservations = reservations || [];
      },
      (error) => {
        this.showToast('Fehler beim Laden der Reservierungen');
      }
    );
  }

onStartTimeChanged() {
  if (!this.startTime) return;

  // Datum übernehmen
  this.date = this.startTime.split("T")[0];

  // Endzeit +1h setzen
  const [datePart, timePart] = this.startTime.split('T');
  const [h, m] = timePart.split(':').map(n => parseInt(n));
  const endHour = (h + 1) % 24;
  this.endTime = `${datePart}T${endHour.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;

  this.updateSelectedSlot();

  if (this._selectedSlot) {
    this.generateIntervalsForSlot(this._selectedSlot);
  }

  this.applyFilter();
}

onDateChanged() {
  if (!this.date) return;

  const [h, m] = this.startTime.split("T")[1].split(":");
  this.startTime = `${this.date}T${h}:${m}`;
  this.endTime   = `${this.date}T${(parseInt(h)+1).toString().padStart(2,'0')}:${m}`;

  this.updateSelectedSlot();

  if (this._selectedSlot) {
    this.generateIntervalsForSlot(this._selectedSlot);
  }

  this.applyFilter();
}

private updateSelectedSlot() {

  if (!this.startTime) return;

  const startDate = this.startTime.split("T")[0];
  const startMs   = new Date(this.startTime).getTime();

  const matchingSlot = this.slots.find(slot => {

    const slotDate = new Date(slot.date).toISOString().split("T")[0];

    if (slotDate !== startDate) return false;

    const slotStart = new Date(slot.range_start).getTime();
    const slotEnd   = new Date(slot.range_end).getTime();

    return startMs >= slotStart && startMs < slotEnd;
  });

  if (matchingSlot) {
    this._selectedSlot = matchingSlot;
    this.selectedSlotId = matchingSlot.id!;
  }
}

  async submitReservation() {
    this.onDateChanged();
    if (!this.validateForm()) {
      return;
    }

    if (!this.selectedTable) {
      this.showToast('Bitte wählen Sie einen Tisch aus');
      return;
    }

    const table = this.tables.find(t => t.id === this.selectedTable);
    if (!table) {
      this.showToast('Ausgewählter Tisch wurde nicht gefunden');
      return;
    }

    if (this.seats! > table.seats) {
      this.showToast(`Dieser Tisch hat nur ${table.seats} Plätze`);
      return;
    }


    const loadingMessage = this.isEditMode
      ? 'Die Reservierung wird aktualisiert...'
      : 'Die Reservierung wird erstellt...';

    const loading = await this.loadingController.create({
      message: loadingMessage,
      spinner: 'circles',
      translucent: true,
      showBackdrop: true
    });
    await loading.present();

    const reservation = {
      customer_name: this.customerName,
      seats: this.seats || 0,
      start: this.startTime,
      end: this.endTime,
      table_id: this.selectedTable
    };

    if (this.isEditMode && this.reservationId) {
      this.orderService.updateTableReservation(this.reservationId, reservation).subscribe(
        async (response) => {
          await loading.dismiss();
          this.showToast('Reservierung erfolgreich aktualisiert');
          this.router.navigate(['/table-reservation']);
        },
        async (error) => {
          await loading.dismiss();
          this.showToast('Fehler beim Aktualisieren der Reservierung');
          console.error('Error:', error);
        }
      );
    } else {
      this.orderService.addTableReservation(reservation).subscribe(
        async (response) => {
          await loading.dismiss();
          this.showToast('Reservierung erfolgreich hinzugefügt');
          this.router.navigate(['/table-reservation']);
        },
        async (error) => {
          await loading.dismiss();
          this.showToast('Fehler beim Hinzufügen der Reservierung');
          console.error('Error:', error);
        }
      );
    }
  }

  validateForm(): boolean {
    if (!this.customerName.trim()) {
      this.showToast('Bitte geben Sie einen Kundennamen ein');
      return false;
    }
    if (!this.seats || this.seats <= 0) {
      this.showToast('Bitte geben Sie die Anzahl der Sitze ein');
      return false;
    }
    if (!this.startTime) {
      this.showToast('Bitte wählen Sie eine Startzeit aus');
      return false;
    }
    if (!this.endTime) {
      this.showToast('Bitte wählen Sie eine Endzeit aus');
      return false;
    }

    const startDate = new Date(this.startTime);
    const endDate = new Date(this.endTime);

    if (startDate.getDate() !== endDate.getDate() ||
      startDate.getMonth() !== endDate.getMonth() ||
      startDate.getFullYear() !== endDate.getFullYear()) {
      this.showToast('Start und Ende müssen am selben Tag sein');
      return false;
    }

    if (startDate >= endDate) {
      this.showToast('Die Endzeit muss nach der Startzeit liegen');
      return false;
    }

    const isWithinSlot = this.slots.some((slot) => {
      const slotStart = new Date(slot.range_start).getTime();
      const slotEnd = new Date(slot.range_end).getTime();
      const startTime = new Date(this.startTime).getTime();
      return startTime >= slotStart && startTime < slotEnd;
    });

    if (!isWithinSlot) {
      this.showToast('Die Startzeit muss innerhalb eines verfügbaren Zeitfensters liegen');
      return false;
    }

    if (!this.selectedTable) {
      this.showToast('Bitte wählen Sie einen Tisch aus');
      return false;
    }

    const startTime = new Date(this.startTime).getTime();
    const endTime = new Date(this.endTime).getTime();

    const hasConflict = this.tableReservations.some((r) => {
      if (this.isEditMode && r.id === this.reservationId) {
        return false;
      }
      if (r.table?.id !== this.selectedTable) {
        return false;
      }
      const rStart = new Date(r.start).getTime();
      const rEnd = new Date(r.end).getTime();
      return startTime < rEnd && endTime > rStart;
    });

    if (hasConflict) {
      this.showToast('Dieser Tisch hat bereits eine Reservierung in diesem Zeitraum');
      return false;
    }

    return true;
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

// #############################################################

  getTableNames(): string[] {
    return Array.from(this.tablesByName.keys()).sort();
  }


getReservation(tableName: string, interval: string): TableReservation | null {
  const reservations = this.tablesByName.get(tableName) || [];
  if (!this._selectedSlot) return null;

  const selectedDate = this.getSelectedDate();
  const [h, m] = interval.split(':').map(Number);

  const intervalStart = new Date(`${selectedDate}T${interval}:00`);
  const intervalEnd   = new Date(intervalStart.getTime() + 15 * 60000);

  return (
    reservations.find(r => {
      const rStart = new Date(r.start);
      const rEnd   = new Date(r.end);
      return rStart < intervalEnd && rEnd > intervalStart;
    }) || null
  );
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


isReserved(tableName: string, interval: string): boolean {
  const reservations = this.tablesByName.get(tableName) || [];
  if (!this._selectedSlot) return false;

  const selectedDate = this.getSelectedDate();
  const [h, m] = interval.split(':').map(Number);

  const intervalStart = new Date(`${selectedDate}T${interval}:00`);
  const intervalEnd   = new Date(intervalStart.getTime() + 15 * 60000);

  return reservations.some(r => {
    const rStart = new Date(r.start);
    const rEnd   = new Date(r.end);
    return rStart < intervalEnd && rEnd > intervalStart;
  });
}

intervals: string[] = [];
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

  private getSelectedDate(): string {
  const src = this.startTime;
  return src.split('T')[0];
}

applyFilter() {
  const all = this.tableReservations ?? [];

  const slot = this.slots.find(s => s.id === this.selectedSlotId) ?? null;

  const selectedDate = this.getSelectedDate();

  let filtered = all.filter(r => r.start.startsWith(selectedDate));

  if (slot) {
    const slotStartTime = new Date(slot.range_start);
    const slotEndTime   = new Date(slot.range_end);

    const slotStart = new Date(`${selectedDate}T${slotStartTime.toTimeString().slice(0,5)}`).getTime();
    const slotEnd   = new Date(`${selectedDate}T${slotEndTime.toTimeString().slice(0,5)}`).getTime();

    filtered = filtered.filter(r => {
      const rStart = new Date(r.start).getTime();
      const rEnd   = new Date(r.end).getTime();
      return rStart < slotEnd && rEnd > slotStart;
    });
  }

  this.filteredReservations = filtered;
  this.groupReservationsByTable();
}
}

