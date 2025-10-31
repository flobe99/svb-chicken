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
  IonListHeader,
  IonList
} from '@ionic/angular/standalone'
import { Router } from '@angular/router';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { OrderService } from 'src/app/services/Order.Service';
import { Slot } from 'src/app/models/slot.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
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
    IonListHeader,
    IonList
  ]
})
export class DashboardPage implements OnInit {
  public slots: Slot[] = [];
  event = {
    name: 'Hähnchenwochenende',
    date: '21. - 22. September 2025',
    location: 'Sportgelände SV Baustetten',
    time: 'ab 11:00 Uhr',
    description: 'Knusprige Hähnchen, kühle Getränke und gute Stimmung - das traditionelle Fest für die ganze Familie!'
  };
  constructor(private router: Router, private orderService: OrderService) { }

  ngOnInit() {
    this.init();
  }

  init() {
    this.orderService.getSlots().subscribe((slots) => {
      this.slots = slots;
      const dates = slots.map(s => new Date(s.date));
      const timestamps = dates.map(d => d.getTime());
      const start = new Date(Math.min(...timestamps));
      const end = new Date(Math.max(...timestamps));
      this.event.date = `${start.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })} - ${end.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    });
  }

  formatTimeRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }


  onClickOrder() {
    this.router.navigate(['/order'])
  }

}
