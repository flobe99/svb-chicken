import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { IonicModule, ToastController } from '@ionic/angular';
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
  IonList, IonCardHeader, IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonNote,
  ToastController
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
    RefreshComponent,
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
    this.router.navigate(['/order'],
      {
        state: { "order": this.order }
      }
    );
  }

  async submitOrder() {
    if (!this.order) return;

    try {
      console.table(this.order);

      const response = await firstValueFrom(this.orderService.createOrder(this.order));
      console.log("response-start");
      console.table(response);
      console.log("response-stop");

      if (response.success) {
        console.log('Navigiere zum Dashboard');
        this.router.navigate(['/dashboard']);
        this.orderService.deleteOrder();


        const toast = await this.toastController.create({
          message: 'Bestellung erfolgreich eingegeben.',
          duration: 2500,
          color: 'success',
          position: 'top'
        });
        await toast.present();
      }
      else {
        let errorMessage = 'Die Bestellung in diesem Zeitfenster ist nicht möglich.';

        // Prüfe auf Fehlercode 400 und zeige die Backend-Fehlermeldung
        if (response.status === 400 && response.error?.detail) {
          errorMessage = response.error.detail;
        }

        const toast = await this.toastController.create({
          message: errorMessage,
          duration: 2500,
          color: 'danger',
          position: 'top'
        });

        await toast.present();
      }

    } catch (error: any) {
      // console.error('Fehler beim Absenden der Bestellung:', error);

      let errorMessage = 'Die Bestellung in diesem Zeitfenster ist nicht möglich.';

      // Prüfe auf Fehlercode 400 und zeige die Backend-Fehlermeldung
      if (error.status === 400 && error.error?.detail) {
        errorMessage = error.error.detail;
      }

      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 2500,
        color: 'danger',
        position: 'top'
      });

      await toast.present();
    }
  }


}
