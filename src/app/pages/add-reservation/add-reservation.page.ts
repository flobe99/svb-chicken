import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
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
  IonButton,
  ToastController,
  LoadingController,
  IonDatetimeButton,
  IonModal
} from '@ionic/angular/standalone';
import { Table } from 'src/app/models/Table.model';
import { TableReservation } from 'src/app/models/TableReservation.model';
import { OrderService } from 'src/app/services/Order.Service';
import { Router, ActivatedRoute } from '@angular/router';
import { Slot } from 'src/app/models/slot.model';
import { BackComponent } from 'src/app/components/back/back.component';

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
    BackComponent
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

  constructor(
    private orderService: OrderService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router,
    private activatedRoute: ActivatedRoute
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

    const [datePart, timePart] = this.startTime.split('T');
    const [hourStr, minuteStr] = timePart.split(':');

    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    hour = (hour + 1) % 24;

    const newHour = hour.toString().padStart(2, '0');
    const newMinute = minute.toString().padStart(2, '0');

    this.endTime = `${datePart}T${newHour}:${newMinute}`;
  }


  async submitReservation() {
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
      const startTime = startDate.getTime();
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
}

