import { Component, OnInit, ViewChild } from '@angular/core';
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
  IonIcon
} from '@ionic/angular/standalone'

import { Router } from '@angular/router';
import { OrderChicken } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/Order.Service';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fastFood, settings, mail, add, fastFoodOutline, informationCircleOutline } from 'ionicons/icons';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';

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
    RefreshComponent
  ]
})
export class OrderPage implements OnInit {

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
    private toastController: ToastController
  ) {
    addIcons({ fastFoodOutline, fastFood, settings, mail, add, informationCircleOutline });
  }


  ngOnInit() {
    this.order = new OrderChicken({
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
  }

  async submitOrder() {
    if (
      !this.order.firstname ||
      !this.order.lastname ||
      !this.order.mail ||
      !this.order.phonenumber ||
      this.order.chicken == null ||
      this.order.nuggets == null ||
      this.order.fries == null ||
      !this.order.miscellaneous
    ) {
      console.log('Bitte alle Felder ausfüllen.');
      this.presentToast('Bitte alle Pflichtfelder ausfüllen');
      return;
    }
    await this.orderService.setOrder(this.order);
    this.router.navigate(['/order-overview'], {});
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
