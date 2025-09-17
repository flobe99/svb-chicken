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
  AlertController,
  IonCol,
  IonRow,
  IonGrid,
  IonCard,
  IonCardContent,
  IonText,
  IonRange,
  IonIcon
} from '@ionic/angular/standalone';
import { Bottles } from 'src/app/models/bottles.model';
import { CocktailRecipe } from 'src/app/models/cocktailRecipe.model';
import { CocktailService } from 'src/app/services/Cocktail.Service';
import { trash, addCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-addIngredients',
  templateUrl: './addIngredients.page.html',
  styleUrls: ['./addIngredients.page.scss'],
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
    IonCol,
    IonRow,
    IonGrid,
    IonCard,
    IonCardContent,
    IonText,
    IonRange,
    IonIcon,
  ],
})

export class AddIngredientsPage implements OnInit {

  public ingredientName: string = ""

  constructor(
    private alertController: AlertController,
    private router: Router,
    private cocktailService: CocktailService
  ) {
    addIcons({
      trash,
      addCircle
    });
  }

  async ngOnInit() {

  }

  async save() {
    if (this.ingredientName != "") {
      const newBottle = new Bottles({
        name: this.ingredientName,
        index: this.ingredientName.toLowerCase().replace(/\s+/g, '-'),
        ratio: 1
      });

      // this.cocktailService.setBottle(newBottle).subscribe((res) => {
      //   if (res.success) {
      //     console.log('Flasche erfolgreich hinzugefügt!');
      //   } else {
      //     console.warn('Fehler:', res.message);
      //   }
      // });

      this.cocktailService.setBottle(newBottle).subscribe({
        next: async (res) => {
          const alert = await this.alertController.create({
            header: 'Zutat gespeichert',
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
            message: 'Die Zutat konnte nicht gespeichert werden.',
            buttons: ['OK'],
          });
          await alert.present();
        }
      });
    }
  }


  cancel() {
    this.router.navigate(['/mix'])
  }

}

