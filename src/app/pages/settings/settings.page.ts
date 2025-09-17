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
  bottles: Bottles[] = [
    // new Bottles({ index: 'none', name: 'Keine Flasche', ratio: 0.0 }),
    // new Bottles({ index: 'vodka', name: 'Vodka', ratio: 0.3 }),
    // new Bottles({ index: 'rum', name: 'Rum', ratio: 0.4 }),
    // new Bottles({ index: 'gin', name: 'Gin', ratio: 0.2 }),
    // new Bottles({ index: 'tequila', name: 'Tequila', ratio: 0.25 }),
    // new Bottles({ index: 'whiskey', name: 'Whiskey', ratio: 0.35 }),
    // new Bottles({ index: 'cola', name: 'Cola', ratio: 0.2 }),
    // new Bottles({ index: 'havana', name: 'Havana', ratio: 0.8 }),
    // new Bottles({ index: 'orange_juice', name: 'Orange Saft', ratio: 0.15 }),
    // new Bottles({ index: 'sekt', name: 'Sekt', ratio: 0.3 }),
    // new Bottles({ index: 'aperol', name: 'Aperol', ratio: 0.4 }),
    // new Bottles({ index: 'wasser', name: 'Wasser', ratio: 0.3 }),
  ];

  selectedBottle: string = this.bottles[0]?.index;
  bottlePumpMap: { [index: string]: string } = {};
  bottleAssignments: { [pumpId: string]: string } = {};

  pumpOptions = [
    { value: 'pump-0', label: 'Pumpe 0' },
    { value: 'pump-1', label: 'Pumpe 1' },
    { value: 'pump-2', label: 'Pumpe 2' },
    { value: 'pump-3', label: 'Pumpe 3' },
    { value: 'pump-4', label: 'Pumpe 4' },
  ];

  constructor(
    private alertController: AlertController,
    private router: Router,
    private cocktailService: CocktailService
  ) {

  }

  async ngOnInit() {
    this.cocktailService.getBottles().subscribe((bottles) => {
      this.bottles = bottles;
    });

    this.cocktailService.getPumpConfiguration().subscribe(config => {
      this.bottleAssignments = {};
      for (const [pumpId, ingredient] of Object.entries(config)) {
        this.bottleAssignments[`pump-${pumpId}`] = ingredient.toLowerCase();
      }
    });
  }


  assignPump(bottleIndex: string, pumpValue: string) {
    this.bottlePumpMap[bottleIndex] = pumpValue;
  }

  updateRatio(bottleIndex: string, newRatio: number) {
    const bottle = this.bottles.find(b => b.index === bottleIndex);
    if (bottle) {
      bottle.ratio = newRatio;
    }
  }

  async save() {
    localStorage.setItem('bottleAssignments', JSON.stringify(this.bottleAssignments));

    this.cocktailService.setPumpConfiguration(this.bottleAssignments).subscribe({
      next: async (res) => {
        const alert = await this.alertController.create({
          header: 'Konfiguration gespeichert',
          message: res.message,
          buttons: ['OK'],
        });
        await alert.present();
        await alert.onDidDismiss();
        this.router.navigate(['/mix']);
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: 'Fehler',
          message: 'Die Konfiguration konnte nicht übertragen werden.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    });
  }

  cancel() {
    this.router.navigate(['/mix'])
  }

}
