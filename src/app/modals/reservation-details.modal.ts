import { Component, Input } from '@angular/core';
import { IonModal, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, ModalController, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { TableReservation } from 'src/app/models/TableReservation.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-details-modal',
  templateUrl: './reservation-details.modal.html',
  standalone: true,
  imports: [
    CommonModule,
    IonModal,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon
  ]
})
export class ReservationDetailsModal {
  @Input() reservation!: TableReservation;
  constructor(private modalCtrl: ModalController, private router: Router) {}

  close() {
    this.modalCtrl.dismiss();
  }

  edit() {
    this.modalCtrl.dismiss(
      { action: 'edit', reservation: this.reservation },
      'confirm'
    );
    this.router.navigate(['/add-reservation', this.reservation.id]);
  }

}
