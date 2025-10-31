import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonDatetime,
  IonTextarea,
  IonPopover,
  IonModal,
  IonDatetimeButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonActionSheet,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonAccordion,
  IonAccordionGroup,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { RefreshComponent } from 'src/app/components/refresh/refresh.component';
import { OrderService } from 'src/app/services/Order.Service';
import { OrderChicken } from 'src/app/models/order.model';
import { StorageService } from 'src/app/services/storage.service';
import { TimePipe } from 'src/app/pipes/time.pipe';
import { addIcons } from 'ionicons';
import {
  close,
  filter,
  ellipsisVerticalOutline,
  createOutline,
  trashOutline,
} from 'ionicons/icons';
import {
  ActionSheetController,
  AlertController,
  ToastController,
} from '@ionic/angular';

@Component({
  selector: 'app-theke',
  templateUrl: './theke.page.html',
  styleUrls: ['./theke.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonDatetime,
    IonTextarea,
    IonText,
    IonPopover,
    IonModal,
    IonDatetimeButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    RefreshComponent,
    IonList,
    IonActionSheet,
    IonChip,
    IonSelect,
    IonSelectOption,
    IonAccordion,
    IonAccordionGroup,
    TimePipe,
    IonSegment,
    IonSegmentButton,
    IonGrid,
    IonRow,
    IonCol
  ],
})
export class ThekePage implements OnInit {
  @ViewChildren('selectRefs') selectRefs!: QueryList<IonSelect>;

  groupedOrders: { [key: string]: OrderChicken[] } = {};
  public viewMode: string = 'list';
  columns = [
    { key: 'CREATED', label: 'Erstellt' },
    { key: 'CHECKED_IN', label: 'DriveIn' },
    { key: 'READY_FOR_PICKUP', label: 'Abholbereit' },
    { key: 'COMPLETED', label: 'Fertig' },
  ];



  // public status = "CREATED";
  constructor(
    private orderService: OrderService,
    private storageService: StorageService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      filter,
      close,
      ellipsisVerticalOutline,
      createOutline,
      trashOutline,
    });
  }

  public orders: OrderChicken[] = [];
  public filteredOrders: OrderChicken[] = [];

  public filter: Partial<Omit<OrderChicken, 'status'>> & { status?: string[] } =
    {};

  ngOnInit() {
    this.init();
  }

  ionViewDidEnter() {
    this.init();
  }

  async init(stateFilter?: any) {
    const savedFilter = await this.storageService.get('orderFilter');
    this.filter = stateFilter ?? savedFilter ?? {};

    await this.orderService.getOrders().subscribe((orders) => {
      this.orders = orders;
      this.applyFilter();
    });

    await this.orderService.connectToOrderWebSocket(() => {
      this.orderService.getOrders().subscribe((orders) => {
        this.orders = orders;
        this.applyFilter();
      });
    });

  }

  groupOrders() {
    this.groupedOrders = {};
    for (const column of this.columns) {
      this.groupedOrders[column.key] = this.filteredOrders.filter(o => o.status === column.key);
    }
  }

  async openActionSheet(order: OrderChicken) {
    const actionSheet = await this.actionSheetController.create({
      header: `Bestellung #${order.id} ${order.lastname}, ${order.firstname}`,
      buttons: [
        {
          text: 'Bearbeiten',
          icon: 'create-outline',
          handler: () => {
            this.editOrder(order);
          },
        },
        {
          text: 'Löschen',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.deleteOrder(order);
          },
        },
        {
          text: 'Abbrechen',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  trackByOrderId(index: number, order: OrderChicken): number {
    return order.id!;
  }

  applyFilter() {

    if (!Array.isArray(this.filter.status)) {
      this.filter.status = [];
    }
    this.filteredOrders = this.orders
      .filter((order) => {
        return (
          (!this.filter.id || order.id === this.filter.id) &&
          (!this.filter.firstname ||
            order.firstname
              .toLowerCase()
              .includes(this.filter.firstname.toLowerCase())) &&
          (!this.filter.lastname ||
            order.lastname
              .toLowerCase()
              .includes(this.filter.lastname.toLowerCase())) &&
          (!this.filter.mail ||
            order.mail
              .toLowerCase()
              .includes(this.filter.mail.toLowerCase())) &&
          (!this.filter.phonenumber ||
            order.phonenumber.includes(this.filter.phonenumber)) &&
          (!this.filter.date || order.date.includes(this.filter.date)) &&
          (!this.filter.miscellaneous ||
            order.miscellaneous
              .toLowerCase()
              .includes(this.filter.miscellaneous.toLowerCase())) &&
          (!this.filter.chicken || order.chicken === this.filter.chicken) &&
          (!this.filter.nuggets || order.nuggets === this.filter.nuggets) &&
          (!this.filter.fries || order.fries === this.filter.fries) &&
          (this.filter.status?.length === 0 ||
            this.filter.status?.includes(order.status))
        );
      })
      .sort((a, b) => {
        const aTime = a.checked_in_at
          ? new Date(a.checked_in_at).getTime()
          : Infinity;
        const bTime = b.checked_in_at
          ? new Date(b.checked_in_at).getTime()
          : Infinity;
        return aTime - bTime;
      });
    this.groupOrders();
    this.storageService.set('orderFilter', this.filter);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filter.firstname ||
      this.filter.lastname ||
      this.filter.date ||
      this.filter.chicken ||
      this.filter.nuggets ||
      this.filter.fries ||
      (Array.isArray(this.filter.status) && this.filter.status.length > 0)
    );
  }

  removeFilter(key: keyof typeof this.filter) {
    this.filter[key] = undefined;
    this.applyFilter();
  }

  removeStatusFilter(index: number) {
    if (Array.isArray(this.filter.status)) {
      const updated = [...this.filter.status];
      updated.splice(index, 1);
      this.filter.status = updated;
      this.applyFilter();
    }
  }

  editOrder(order: OrderChicken) {
    this.router.navigate(['/order'], {
      state: { order },
    });
  }

  async deleteOrder(order: OrderChicken) {
    const alert = await this.alertController.create({
      header: 'Bestellung löschen',
      message: 'Möchtest du die Bestellung wirklich löschen?',
      buttons: [
        {
          text: 'Nein',
          role: 'cancel',
        },
        {
          text: 'Ja',
          handler: () => {
            this.orderService
              .deleteOrderById(order.id!)
              .subscribe(async (response) => {
                if (response.success) {
                  const toast = await this.toastController.create({
                    message: 'Bestellung erfolgreich gelöscht.',
                    duration: 2000,
                    color: 'success',
                    position: 'bottom',
                  });
                  await toast.present();
                }
              });
          },
        },
      ],
    });

    await alert.present();
  }

  openSelect(order: OrderChicken) {
    const index = this.filteredOrders.indexOf(order);
    const select = this.selectRefs.get(index);
    select?.open();
  }

  statusLabels: { [key: string]: string } = {
    CREATED: 'Erstellt',
    CHECKED_IN: 'DriveIn',
    READY_FOR_PICKUP: 'Abholbereit',
    COMPLETED: 'Fertig',
    CANCELLED: 'Storniert',
    PAID: 'Bezahlt',
    PRINTED: 'Gedruckt',
    PREPARING: 'In Vorbereitung',
  };

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  onStatusChange(event: any, order: OrderChicken) {
    const newStatus = event.detail.value;
    order.status = newStatus;

    if (order.checked_in_at === '') {
      order.checked_in_at = null as any;
    }

    if (order.id) {
      this.orderService.updateOrder(order.id, order).subscribe((response) => {
        if (response.success) {
          console.log(
            `Status für Bestellung ${order.id} erfolgreich aktualisiert: ${newStatus}`
          );
        } else {
          console.error(
            `Fehler beim Aktualisieren von Bestellung ${order.id}`,
            response.error
          );
        }
      });
    }
    this.applyFilter();
  }
}
