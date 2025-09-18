import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  ModalController,
  IonRefresher,
  IonRefresherContent,
  AlertController
} from '@ionic/angular/standalone';
import { Bottles } from 'src/app/models/bottles.model';
import { CocktailService } from 'src/app/services/Cocktail.Service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonRefresher,
    IonRefresherContent,
  ],
})

export class SettingsPage implements OnInit {

  constructor(
    private alertController: AlertController,
    private router: Router,
    private cocktailService: CocktailService
  ) {

  }

  async ngOnInit() { }

  async save() {
  }

  cancel() {
    this.router.navigate(['/order'])
  }

}
