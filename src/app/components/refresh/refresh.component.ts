import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-refresh',
  templateUrl: './refresh.component.html',
  styleUrls: ['./refresh.component.scss'],
  standalone: true,
  imports: [
    IonRefresher,
    IonRefresherContent,

  ]
})
export class RefreshComponent implements OnInit {
  @Input() refreshFn!: () => Promise<void>;

  constructor(private router: Router) { }

  ngOnInit(): void {

  }

  doRefresh(event: any) {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
      event.target.complete();
    });
  }
}
