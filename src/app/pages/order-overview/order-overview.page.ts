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
import { firstValueFrom } from 'rxjs';
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
    const orderObservable = await this.orderService.getOrder();

    orderObservable.subscribe(async order => {
      if (order) {
        this.order = order;
        console.table(this.order);

        try {
          const price = await firstValueFrom(this.orderService.getOrderPrice(order));
          console.table(price);
          this.order.price = price;
        } catch (error) {
          console.error('Fehler beim Preisabruf:', error);
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }


  async submitOrder() {
    if (!this.order) return;

    try {
      console.table(this.order);

      const response = await firstValueFrom(this.orderService.createOrder(this.order));
      console.log("response-start");
      console.table(response);
      console.log("response-stop");
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
        await this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Fehler beim Absenden der Bestellung:', error);
      const toast = await this.toastController.create({
        message: 'Fehler beim Absenden der Bestellung.',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }
}
