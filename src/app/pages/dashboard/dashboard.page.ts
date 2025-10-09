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
  IonCardContent

} from '@ionic/angular/standalone'
import { Router } from '@angular/router';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';

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
    RefreshComponent
  ]
})
export class DashboardPage implements OnInit {
  event = {
    name: 'Hähnchenwochenende',
    date: '21. - 22. September 2025',
    location: 'Sportgelände SV Baustetten',
    time: 'ab 11:00 Uhr',
    description: 'Knusprige Hähnchen, kühle Getränke und gute Stimmung - das traditionelle Fest für die ganze Familie!'
  };
  constructor(private router: Router) { }

  ngOnInit() {
  }

  onClickOrder() {
    this.router.navigate(['/order'])
  }

}
