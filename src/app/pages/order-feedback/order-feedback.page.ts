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
  IonMenuButton, IonCardHeader, IonCard, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TimePipe } from 'src/app/pipes/time.pipe';
import { OrderService } from 'src/app/services/Order.Service';
import { OrderChicken } from 'src/app/models/order.model';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';

@Component({
  selector: 'app-order-feedback',
  templateUrl: './order-feedback.page.html',
  styleUrls: ['./order-feedback.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCardTitle, IonCard, IonCardHeader,
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
    TimePipe,
    RefreshComponent
  ],
})
export class OrderFeedbackPage implements OnInit {
  public order: OrderChicken | null = null;

  constructor(private router: Router, private orderService: OrderService) { }

  async ngOnInit() {
    (await this.orderService.getOrder()).subscribe((order) => {
      this.order = order;
    })
  }

  ionViewDidEnter() {
    this.orderService.deleteOrder();
  }

  backToOrder() {
    this.orderService.deleteOrder();
    this.router.navigate(['/order']).then();
  }

}
