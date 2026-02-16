import { Component, HostListener, OnInit } from '@angular/core';
import { addIcons } from "ionicons";
import {
  IonButton,
  IonIcon,
  IonLabel,
  IonGrid, IonRow, IonCol,
  ModalController,
} from "@ionic/angular/standalone";
import { NavController } from '@ionic/angular';
import {
  arrowBackOutline
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-back',
  templateUrl: './back.component.html',
  styleUrls: ['./back.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonLabel,
    IonGrid, IonRow, IonCol,
    IonIcon,
  ],
  standalone: true,
  providers: [ModalController]
})
/**
 * Class represents the call component that takes a telephone number as parameter and converts it into a clickable button
 * Button click performs a dial on device
 * @author Chris Michel
 */
export class BackComponent implements OnInit {

  public offsetSize = 0;
  public mainSize = 12;
  public backEnabled = true;

  constructor(private router: Router,
    private navCtrl: NavController,
  ) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.backEnabled = !((window.location.href.indexOf("/login") > 0 || window.location.href.indexOf("/dashboard") > 0));
  }


  goBack() {
    this.navCtrl.pop().then((navigated) => {
      if (!navigated) {
        this.navCtrl.navigateBack('/dashboard').then();
      }
    });
  }
}
