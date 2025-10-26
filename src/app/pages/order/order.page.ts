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
  IonNote
} from '@ionic/angular/standalone'

import { Router } from '@angular/router';
import { OrderChicken } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/Order.Service';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fastFood, settings, mail, add, fastFoodOutline, informationCircleOutline } from 'ionicons/icons';
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
    IonNote
  ]
})
export class OrderPage implements OnInit {

  public edit = false;
  public dateValid: boolean = true;

  public order: OrderChicken = new OrderChicken({
    firstname: "Florian",
    lastname: "Betz",
    mail: "betz.flori@gmail.com",
    phonenumber: "015254058901",
    date: new Date().toISOString(),
    chicken: 1,
    nuggets: 1,
    fries: 2,
    miscellaneous: "Viel Gewürz",
  })

  constructor(
    private router: Router,
    private orderService: OrderService,
    private toastController: ToastController,
    private location: Location,
  ) {
    addIcons({ fastFoodOutline, fastFood, settings, mail, add, informationCircleOutline });
  }

  ngOnInit() {
    this.init()
  }

  ionViewWillEnter() {
    this.init
  }

  init() {
    const nav = this.router.getCurrentNavigation();
    const stateOrder = nav?.extras?.state?.['order'];

    if (stateOrder) {
      this.edit = true
    }

    this.order = stateOrder
      ? new OrderChicken(stateOrder)
      : new OrderChicken({
        firstname: "",
        lastname: "",
        mail: "",
        phonenumber: "",
        date: new Date().toISOString(),
        chicken: 0,
        nuggets: 0,
        fries: 0,
        miscellaneous: "",
      });

    this.validateDate();
  }



  async deleteOrder(order: OrderChicken) {
    console.table(order)
    this.orderService.deleteOrderById(order.id!).subscribe((response) => {
      console.table(response)
      if (response.success) {
        this.location.back();
      }
    });
  }

  async submitOrder() {
    await this.validateDate();
    if (!this.dateValid) {
      this.presentToast('Datum bzw. Uhrzeit ist ungültig', 'danger');
      return;
    }
    if (
      !this.order.firstname ||
      !this.order.lastname ||
      !this.order.mail ||
      !this.order.phonenumber ||
      this.order.chicken == null ||
      this.order.nuggets == null ||
      this.order.fries == null
    ) {
      this.presentToast('Bitte alle Pflichtfelder ausfüllen');
      return;
    }
    console.table(this.order)
    if (this.order.id) {
      this.orderService.updateOrder(this.order.id, this.order).subscribe((response) => {
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

  async validateDate() {
    try {
      const response = await this.orderService.validateOrder(this.order).toPromise();
      this.dateValid = response?.valid!;
    } catch (error: unknown) {
      this.dateValid = false;
      const err = error as HttpErrorResponse;
      this.presentToast(err.error?.detail || 'Fehler bei der Validierung', 'danger');
    }
  }



  async presentToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
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
