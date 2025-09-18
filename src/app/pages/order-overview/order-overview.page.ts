import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  IonList, IonCardHeader, IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonNote } from '@ionic/angular/standalone';

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
  ]
})
export class OrderOverviewPage implements OnInit {

  data: any;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.data = nav?.extras?.state || {};

    console.log(nav?.extras?.state)
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/']);
  }


  submitOrder(){
    this.router.navigate(['/order-verification'], {
      state: {
        ...this.data
      }
    });
  }

}
