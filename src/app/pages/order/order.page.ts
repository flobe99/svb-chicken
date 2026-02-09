import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
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
  IonNote,
  IonCard,
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';
import { OrderChicken } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/Order.Service';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  fastFood,
  settings,
  mail,
  add,
  fastFoodOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
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
    RefreshComponent,
    IonNote,
    IonCard,
  ],
})
export class OrderPage implements OnInit {
  public edit = false;
  // public dateValid: boolean = true;

  public dateErrorText = '';
  public chickenErrorText = '';
  public nuggetsErrorText = '';
  public friesErrorText = '';
  public editOrder: OrderChicken | null = null;

  public order: OrderChicken = new OrderChicken({
    firstname: 'Florian',
    lastname: 'Betz',
    mail: 'betz.flori@gmail.com',
    phonenumber: '015254058901',
    date: this.roundToNextQuarterHour(new Date()),
    chicken: 1,
    nuggets: 1,
    fries: 2,
    miscellaneous: 'Viel Gewürz',
  });

  constructor(
    private router: Router,
    private orderService: OrderService,
    private toastController: ToastController,
    private location: Location
  ) {
    addIcons({
      fastFoodOutline,
      fastFood,
      settings,
      mail,
      add,
      informationCircleOutline,
    });
  }

  ngOnInit() {
    this.init();
  }

  ionViewWillEnter() {
    this.init();
  }

  ionViewWillLeave(){
    this.edit = false;
    this.order = new OrderChicken();
    this.orderService.clearEditOrder();
  }

  async init() {

  (await this.orderService.getEditOrder()).subscribe(order => {
    if (order) {
      this.order = order;
      this.edit = true;
    }
    else {
      this.order = new OrderChicken({
        firstname: '',
        lastname: '',
        mail: '',
        phonenumber: '',
        date: this.roundToNextQuarterHour(new Date()),
        chicken: 0,
        nuggets: 0,
        fries: 0,
        miscellaneous: '',
      });
    }

    this.validateOrder();
  });


    if (this.order) {
      this.edit = true;
    } else {
      this.order = new OrderChicken({
        firstname: '',
        lastname: '',
        mail: '',
        phonenumber: '',
        date: this.roundToNextQuarterHour(new Date()),
        chicken: 0,
        nuggets: 0,
        fries: 0,
        miscellaneous: '',
      });
    }

    this.validateOrder(); // <-- wird jetzt NACH dem Laden ausgeführt
  }

  roundToNextQuarterHour(date: Date): string {
    const local = new Date(date.getTime());
    const minutes = local.getMinutes();
    const remainder = 15 - (minutes % 15);

    local.setMinutes(minutes + remainder);
    local.setSeconds(0);
    local.setMilliseconds(0);

    const tzOffset = local.getTimezoneOffset() * 60000;
    const localTime = new Date(local.getTime() - tzOffset);
    return localTime.toISOString().slice(0, 16);
  }

  async deleteOrder(order: OrderChicken) {
    this.orderService.deleteOrderById(order.id!).subscribe((response) => {
      if (response.success) {
        this.location.back();
      }
    });
  }

  async submitOrder() {
    if (
      !this.order.firstname ||
      !this.order.lastname ||
      // !this.order.mail ||
      // !this.order.phonenumber ||
      this.order.chicken == null ||
      this.order.nuggets == null ||
      this.order.fries == null
    ) {
      this.presentToast('Bitte alle Pflichtfelder ausfüllen');
      return;
    }
    console.table(this.order)
    const isValid = await this.validateOrder();
    if (!isValid) {
      return;
    }
    if (this.dateErrorText != '') {
      this.presentToast('Datum bzw. Uhrzeit ist ungültig', 'danger');
      return;
    }
    if (this.order.id) {
      this.orderService
        .updateOrder(this.order.id, this.order)
        .subscribe((response) => {
          if (response.success) {
            this.presentToast('Bestellung aktualisiert', 'success');
            this.router.navigate(['/theke']);
            this.orderService.deleteOrder();
          } else {
            this.presentToast('Fehler beim Aktualisieren', 'danger');
          }
        });
    } else {
      await this.orderService.setOrder(this.order);
      this.router.navigate(['/order-overview']);
    }
  }

  setErrorMessages(errors: any) {
    for (const error of errors) {
      const code = error.code;
      const message = error.detail;

      if (code === 'INVALID_TIME') {
        this.dateErrorText =
          'Zeit invalide (muss auf Viertelstunde genau sein z.b. 18:15)';
      }
      if (code === 'INVALID_TIME_SLOT') {
        this.dateErrorText = 'Zeit ist in keinen Slot';
      }
      if (code === 'LIMIT_CHICKEN_EXCEEDED') {
        this.chickenErrorText = 'Menge für Slot überschritten';
      }
      if (code === 'LIMIT_NUGGETS_EXCEEDED') {
        this.nuggetsErrorText = 'Menge für Slot überschritten';
      }
      if (code === 'LIMIT_FRIES_EXCEEDED') {
        this.friesErrorText = 'Menge für Slot überschritten';
      }

      this.presentToast(message, 'danger');
    }
  }

  async validateOrder(): Promise<boolean> {
    console.table(this.order)
    this.dateErrorText = '';
    this.chickenErrorText = '';
    this.nuggetsErrorText = '';
    this.friesErrorText = '';
    // this.dateValid = true;

    try {
      const response = await this.orderService
        .validateOrder(this.order)
        .toPromise();

      const errors = response?.message.detail?.errors ?? [];
      this.setErrorMessages(errors);
      return errors.length === 0;
    } catch (error: unknown) {
      const err = error as HttpErrorResponse;
      const errors = err.error?.detail?.errors ?? [];

      this.setErrorMessages(errors);

      // Falls keine strukturierte Fehlerliste vorhanden ist
      if (errors.length === 0) {
        this.presentToast(
          err.error?.detail || 'Fehler bei der Validierung',
          'danger'
        );
      }
      return false;
    }
  }

  async presentToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }

  tooltipVisible = false;
  tooltipText = '';

  toggleTooltip(text: string) {
    if (this.tooltipVisible && this.tooltipText === text) {
      this.tooltipVisible = false;
    } else {
      this.tooltipText = text;
      this.tooltipVisible = true;

      setTimeout(() => {
        this.tooltipVisible = false;
      }, 3000);
    }
  }
}
