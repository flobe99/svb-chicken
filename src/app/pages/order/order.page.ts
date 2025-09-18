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


  public vorname: string = '';
  public nachname: string = '';
  public email: string = '';
  public phonenumber: string = '';
  public datum: string = '';
  public haehnchen: number = 0;
  public nuggets: number = 0;
  public pommes: number = 0;
  public sonstiges: string = '';

  constructor(
    private router: Router
  ) { }


  ngOnInit() {
    this.vorname = "Florian";
    this.nachname = "Betz";
    this.email = "betz.flori@gmail.com";
    this.datum = "18.09.2025";
    this.haehnchen = 1;
    this.nuggets = 1;
    this.pommes = 2;
    this.sonstiges = "Viel Gewürz";
  }

  async submitOrder(){
    this.router.navigate(['/order-overview'], {
      state: {
        vorname: this.vorname,
        nachname: this.nachname,
        email: this.email,
        datum: this.datum,
        haehnchen: this.haehnchen,
        nuggets: this.nuggets,
        pommes: this.pommes,
        sonstiges: this.sonstiges,
      }
    });
  }

}
