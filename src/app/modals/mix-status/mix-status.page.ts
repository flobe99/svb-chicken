import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonProgressBar,
  IonList,
  IonItem,
  IonLabel,
  ModalController,
  IonImg
} from '@ionic/angular/standalone';
import { CocktailStatus } from 'src/app/models/CocktailStatus.model';

@Component({
  selector: 'app-mix-status',
  templateUrl: './mix-status.page.html',
  styleUrls: ['./mix-status.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonProgressBar, IonList,
    IonItem,
    IonLabel,
    CommonModule,
    IonImg]
})
export class MixStatusPage implements OnInit {
  @Input() statusList: CocktailStatus[] = [];

  public currentStatus: CocktailStatus | null = null;

  constructor(
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('StatusList im Modal:', this.statusList);
  }

  ngDoCheck() {
    if (this.statusList.length > 0) {
      const latest = this.statusList[this.statusList.length - 1];
      if (this.currentStatus !== latest) {
        this.currentStatus = latest;
        this.cdr.detectChanges();
      }
    }

  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
