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
import { OrderService } from 'src/app/services/Order.Service';
import { OrderChicken } from 'src/app/models/order.model';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';

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
    IonMenuButton,
    RefreshComponent
  ],
})
export class OrderVerificationPage implements OnInit {
  // data: any;
  public order: OrderChicken | null = null;
  code = '';

  constructor(private router: Router, private orderService: OrderService) { }

  ngOnInit() {
    this.orderService.getOrder().subscribe((order) => {
      this.order = order;
    })
  }

  confirmCode() {
    this.router.navigate(['/order-feedback'], {});
  }
}
