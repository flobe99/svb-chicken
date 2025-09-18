import { Component, OnInit } from '@angular/core';
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
  IonIcon,
  IonToast,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CocktailService } from 'src/app/services/Cocktail.Service';
import { WebSocketService } from 'src/app/services/Websocket.Service';
import { Cocktail } from 'src/app/models/cocktail.model';
import { CocktailRecipe } from 'src/app/models/cocktailRecipe.model';
import { CocktailStatus } from 'src/app/models/CocktailStatus.model';
import { MixStatusPage } from 'src/app/modals/mix-status/mix-status.page';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { trash, addCircle, pencilSharp } from 'ionicons/icons';

import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { addIcons } from 'ionicons';
import { Bottles } from 'src/app/models/bottles.model';

@Directive({
  selector: '[appLongPress]'
})
export class LongPressDirective {
  @Output() longPress = new EventEmitter<Event>(); // Übergibt das native Event
  private pressTimer: any;

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onPressStart(event: Event) {
    this.pressTimer = setTimeout(() => {
      this.longPress.emit(event); // Event weitergeben
    }, 600);
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  @HostListener('touchend')
  onPressEnd() {
    clearTimeout(this.pressTimer);
  }
}

@Component({
  selector: 'app-mix',
  templateUrl: './mix.page.html',
  styleUrls: ['./mix.page.scss'],
  standalone: true,
  providers: [ModalController],
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
    LongPressDirective,
    IonToast,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle
  ],
})
export class MixPage implements OnInit {
  glas = 120;
  cocktailIndex = '';
  ingredients: { [key: string]: number } = {};
  statusList: CocktailStatus[] = [];

  // public cocktails: CocktailRecipe[] = cocktails_selection
  public cocktails: CocktailRecipe[] = []
  public bottles: Bottles[] = [];

  public cocktailFinished = true;

  private popupOpen = false;

  toastButtons = [
    {
      text: 'Details',
      handler: () => {
        this.onShowStatusClick();
        return false;
      }
    },
  ];

  constructor(
    private cocktailService: CocktailService,
    private websocketService: WebSocketService,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
  ) {
    addIcons({
      trash,
      pencilSharp
    });
  }

  ngOnInit() {
    this.init(true)
  }

  init(viewCreation = false) {
    this.websocketService.connect((status: CocktailStatus) => {
      console.log('WebSocket-Nachricht:', status);
      this.cocktailFinished = status.finished;
      this.statusList.push(status);
    });

    this.cocktailService.getCocktailRecipes().subscribe((cocktailsselection) => {
      this.cocktails = cocktailsselection
      this.cocktailIndex = viewCreation ? this.cocktails[0].index : this.cocktailIndex;
      this.updateIngredients();
    });

    this.cocktailService.getBottles().subscribe((bottles) => {
      this.bottles = bottles;
    });

  }
  @HostListener('contextmenu', ['$event'])
  onItemLongPress(event: Event) {
    event.preventDefault();
    const selected = this.getSelectedCocktail()
    this.presentEditPopup(selected);
  }

  ionViewDidEnter() {
    this.init()
  }

  ngOnDestroy() {
    this.websocketService.disconnect();
  }

  updateIngredients() {
    const selected = this.cocktails.find(c => c.index === this.cocktailIndex);
    if (selected) {
      const initial: { [key: string]: number } = {};
      selected.bottles.forEach(b => {
        initial[b.index] = Math.round((b.ratio ?? 0) * this.glas);
      });
      this.ingredients = initial;
    }
  }

  async handleMix() {
    this.statusList = [];
    await this.presentStatusModal();

    const cocktail: Cocktail = {
      name: this.cocktailIndex,
      ingredients: Object.entries(this.ingredients).map(([name, amountMl]) => ({
        name,
        amountLiter: amountMl / 1000,
      })),
    };

    this.cocktailService.mixCocktail(cocktail).subscribe((result) => {
      if (result.success) {
        console.log('Cocktail wurde gemixt...');
      } else {
        console.log('Fehler beim Mixen');
        // this.statusList.push(result.msg || 'Unbekannter Fehler');
      }
    });
  }

  onMixClick() {
    const total = Object.values(this.ingredients).reduce((sum, val) => sum + val, 0);
    if (total <= this.glas) {
      console.log('Bottles:', this.ingredients);
      this.presentCocktailMixConfirmModel();
    } else {
      console.log('The glas is too small. Please reduce the bottle liquid.')
      this.presentError('Error', 'The glas is too small. Please reduce the bottle liquid.');
    }
  }

  async presentCocktailMixConfirmModel() {
    this.cocktailIndex
    const alert = await this.alertController.create({
      header: "Cocktail mixen",
      message: "Cocktail " + this.cocktailIndex + " mixen",
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.handleMix()
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async onShowStatusClick() {
    await this.presentStatusModal();
  }

  handleGlobalRefresh(event: CustomEvent) {
    window.location.reload();
  }
  async presentStatusModal() {
    const modal = await this.modalController.create({
      component: MixStatusPage,
      componentProps: {
        statusList: this.statusList,
      },
    });
    await modal.present();
  }

  getSelectedCocktail(): CocktailRecipe | undefined {
    return this.cocktails.find(c => c.index === this.cocktailIndex);
  }

  async presentError(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async presentEditPopup(cocktail: any) {
    if (this.popupOpen) return;
    this.popupOpen = true;

    const alert = await this.alertController.create({
      header: 'Aktion wählen',
      message: `"${cocktail.name}" bearbeiten`,
      buttons: [
        {
          text: 'Edit',
          handler: () => {
            this.router.navigate(['add-recipes'], {
              state: { cocktail: cocktail }
            });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
    await alert.onDidDismiss();
    this.popupOpen = false;
  }


}
