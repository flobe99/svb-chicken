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
  IonMenuButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-verification',
  templateUrl: './order-verification.page.html',
  styleUrls: ['./order-verification.page.scss'],
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
    IonMenuButton
  ],
})
export class OrderVerificationPage implements OnInit {
  data: any;
  code = '';

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.data = nav?.extras?.state || {};

    console.log(this.data)
  }

  ngOnInit() {
  }

  confirmCode() {
    this.router.navigate(['/order-feedback'], {
      state: {
        ...this.data
      }
    });
  }
}
