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
  IonMenuButton, IonCardHeader, IonCard, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

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
    IonMenuButton
  ],
})
export class OrderFeedbackPage implements OnInit {
  data: any

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.data = nav?.extras?.state || {};

    console.log(nav?.extras?.state)
  }

  ngOnInit() {
  }

  backToOrder(){
    this.router.navigate(['/order']).then()
  }

}
