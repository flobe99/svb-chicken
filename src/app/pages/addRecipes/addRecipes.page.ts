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
  selector: 'app-addRecipes',
  templateUrl: './addRecipes.page.html',
  styleUrls: ['./addRecipes.page.scss'],
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

export class AddRecipesPage implements OnInit {

  public cocktailName: string = "";
  public cocktailIndex: string | null = null;
  public chosenBottleIndex: string = '';

  public cocktails: CocktailRecipe[] = []
  public bottles: Bottles[] = []
  ingredients: { [key: string]: number } = {};
  public addedIngredients: { bottleIndex: string; ratio: number }[] = [];
  public isEditMode = false;

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
    this.init();
  }

  ionViewWillEnter() {
    this.init()
  }

  ionViewWillLeave() {
    this.isEditMode = false;
    this.cocktailIndex = null;
    this.cocktailName = "";
    this.addedIngredients = [];
  }


  init() {
    const nav = this.router.getCurrentNavigation();
    const cocktail = nav?.extras?.state?.['cocktail'] ?? window.history.state?.cocktail;
    if (cocktail) {
      this.isEditMode = true;
      this.cocktailIndex = cocktail.index;
      this.cocktailName = cocktail.name;
      this.addedIngredients = cocktail.bottles.map((b: Bottles) => ({
        bottleIndex: b.index,
        ratio: (b.ratio ?? 0) * 100
      }));
    }
    this.cocktailService.getBottles().subscribe((bottles) => {
      this.bottles = bottles;
    });
  }

  ionViewDidEnter() {
    this.init()
  }

  add() {
    this.addedIngredients.push({
      bottleIndex: this.chosenBottleIndex,
      ratio: 50
    });
  }

  removeIngredient(index: number) {
    this.addedIngredients.splice(index, 1);
  }

  async save() {
    const ratio_sum = this.addedIngredients.reduce((sum, ingredient) => sum + ingredient.ratio, 0);

    const allNamesSet = this.addedIngredients.every(ingredient => {
      const bottle = this.bottles.find(b => b.index === ingredient.bottleIndex);
      return bottle?.name && bottle.name.trim() !== '';
    });

    if (ratio_sum === 100 && this.cocktailName != "" && this.addedIngredients.length > 0 && allNamesSet) {
      this.cocktailIndex = this.cocktailIndex ? this.cocktailIndex : this.cocktailName.toLowerCase().replace(/\s+/g, '-')
      const recipe: CocktailRecipe = {
        index: this.cocktailIndex,
        name: this.cocktailName,
        bottles: this.addedIngredients.map(ingredient => {
          const bottle = this.bottles.find(b => b.index === ingredient.bottleIndex);
          return {
            name: bottle?.name || '',
            index: ingredient.bottleIndex,
            ratio: ingredient.ratio / 100
          };
        })

      };

      const request = this.isEditMode
        ? this.cocktailService.updateCocktailRecipe(recipe)
        : this.cocktailService.setCocktailRecipe(recipe);

      console.log("isEditMode: " + this.isEditMode);

      request.subscribe({
        next: async (res) => {
          const alert = await this.alertController.create({
            header: this.isEditMode ? 'Rezept aktualisiert' : 'Rezept gespeichert',
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
            message: 'Das Cocktail-Rezept konnte nicht gespeichert werden.',
            buttons: ['OK'],
          });
          await alert.present();
        }
      });
    } else {
      const alert = await this.alertController.create({
        header: 'Ungültige Mischung',
        message: `Die Gesamtmenge muss genau 100% betragen. Aktuell: ${ratio_sum}%`,
        buttons: ['OK'],
      });
      await alert.present();
    }
  }


  cancel() {
    this.router.navigate(['/mix'])
  }

  async delete() {
    let index = this.cocktailIndex;
    const alert = await this.alertController.create({
      header: 'Rezept löschen',
      message: 'Möchtest du dieses Rezept wirklich löschen?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Löschen',
          handler: () => {
            this.cocktailService.deleteCocktailRecipe(this.cocktailIndex!).subscribe({
              next: async (res) => {
                const confirm = await this.alertController.create({
                  header: 'Gelöscht',
                  message: res.message,
                  buttons: ['OK']
                });
                await confirm.present();
                this.router.navigate(['/mix']);
              },
              error: async () => {
                const errorAlert = await this.alertController.create({
                  header: 'Fehler',
                  message: 'Das Rezept konnte nicht gelöscht werden.',
                  buttons: ['OK']
                });
                await errorAlert.present();
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }


}

