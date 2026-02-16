import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Output() refreshed = new EventEmitter<void>();

  constructor(private router: Router) { }

  ngOnInit(): void {

  }

  doRefresh(event: any) {
    this.refreshed.emit();
    event.target.complete();
  }
}
