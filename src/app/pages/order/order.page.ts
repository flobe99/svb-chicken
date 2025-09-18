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
} from '@ionic/angular/standalone'

import { Router } from '@angular/router';
import { OrderChicken } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/Order.Service';

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
    IonTextarea

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

  // public firstname: string = '';
  // public lastname: string = '';
  // public mail: string = '';
  // public phonenumber: string = '';
  // public date: string = '';
  // public chicken: number = 0;
  // public nuggets: number = 0;
  // public fries: number = 0;
  // public miscellaneous: string = '';

  constructor(
    private router: Router,
    private orderService: OrderService
  ) { }


  ngOnInit() {
    this.order = new OrderChicken({
      id: '0',
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
    // this.order.firstname = "Florian";
    // this.order.lastname = "Betz";
    // this.order.mail = "betz.flori@gmail.com";
    // this.order.phonenumber = "015254058901";
    // this.order.date = new Date().toISOString();
    // this.order.chicken = 1;
    // this.order.nuggets = 1;
    // this.order.fries = 2;
    // this.order.miscellaneous = "Viel Gewürz";
  }

  async submitOrder() {
    this.orderService.setOrder(this.order);
    this.router.navigate(['/order-overview'], {});
  }

}
