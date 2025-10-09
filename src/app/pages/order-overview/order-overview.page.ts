import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular'; import {
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
  IonList, IonCardHeader, IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonNote,
} from '@ionic/angular/standalone';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { OrderChicken } from 'src/app/models/order.model';
import { TimePipe } from 'src/app/pipes/time.pipe';
import { OrderService } from 'src/app/services/Order.Service';

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.page.html',
  styleUrls: ['./order-overview.page.scss'],
  standalone: true,
  imports: [IonNote, IonCardContent, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader,
    IonList,
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
  ]
})
export class OrderOverviewPage implements OnInit {

  public order: OrderChicken | null = null;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private toastController: ToastController) { }

  async ngOnInit() {
    (await this.orderService.getOrder()).subscribe((order) => {
      this.order = order;
      console.table(this.order)
    })
  }

  goBack() {
    this.router.navigate(['/']);
  }


  submitOrder() {
    // this.router.navigate(['/order-verification']);
    console.table(this.order)
    if (this.order) {
      this.orderService.createOrder(this.order).subscribe(async (response) => {
        const toast = await this.toastController.create({
          message: response.success
            ? 'Bestellung erfolgreich eingegeben.'
            : 'Fehler beim Absenden der Bestellung.',
          duration: 2500,
          color: response.success ? 'success' : 'danger',
          position: 'top'
        });
        await toast.present();

        if (response.success) {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }


}
