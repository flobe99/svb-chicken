import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButtons, IonInputPasswordToggle, IonButton, IonMenuButton, IonCard, IonItem, IonLabel, IonCardTitle } from '@ionic/angular/standalone';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonInput, IonInputPasswordToggle, IonButton, IonButtons, IonMenuButton, RefreshComponent, IonCard, IonCardTitle, IonItem, IonLabel
  ]
})
export class LoginPage implements OnInit {
  public username: string = ""
  public password: string = ""
  constructor() { }

  ngOnInit() {
  }

  login() {

  }

}
