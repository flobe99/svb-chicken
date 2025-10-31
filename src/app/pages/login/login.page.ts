import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButtons, IonInputPasswordToggle, IonButton, IonMenuButton, IonCard, IonItem, IonLabel, IonCardTitle } from '@ionic/angular/standalone';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { OrderService } from 'src/app/services/Order.Service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
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
  constructor(private authService: AuthService,private orderService: OrderService, private router: Router) { }

  ngOnInit() {
  }


  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        localStorage.setItem('access_token', response.access_token);
        this.router.navigate(['/theke']);
      },
      error: (err) => {
        console.error('Login fehlgeschlagen:', err);
        alert('Login fehlgeschlagen: Benutzername oder Passwort falsch');
      },
    });
  }
}
