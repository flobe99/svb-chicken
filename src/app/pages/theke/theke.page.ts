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
import { OrderChicken, OrderStatus } from 'src/app/models/order.model';
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
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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
    IonCol,
    DragDropModule
  ],
})
export class ThekePage implements OnInit {
  @ViewChildren('selectRefs') selectRefs!: QueryList<IonSelect>;
  @ViewChildren('selectRefsKanban') selectRefsKanban!: QueryList<IonSelect>;

  public connectedDropLists: string[] = [];
  public groupedOrders: { [key: string]: OrderChicken[] } = {};
  public filteredOrders: OrderChicken[] = [];
  public viewMode: string = 'list';
  columns = [{ key: 'CREATED', label: 'Erstellt', state: true }]
  default_columns = [
    { key: 'CREATED', label: 'Erstellt', state: true },
    { key: 'CHECKED_IN', label: 'DriveIn', state: true },
    { key: 'READY_FOR_PICKUP', label: 'Abholbereit', state: true },
    { key: 'COMPLETED', label: 'Fertig', state: true },
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


  public filter: Partial<Omit<OrderChicken, 'status'>> & { status?: string[] } =
    {};

  ngOnInit() {
    this.init();
  }

  ionViewDidEnter() {
    this.init();
  }

  async init(stateFilter?: any) {

    const savedColumns = await this.storageService.get('columns');
    this.columns = savedColumns ? savedColumns : this.default_columns;

    const viewModeStorage = await this.storageService.get('viewMode');
    this.viewMode = viewModeStorage ? viewModeStorage : this.viewMode;
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

  onViewModeChange() {
    this.storageService.set('viewMode', this.viewMode);
  }

  get activeColumns() {
    return this.columns.filter(c => c.state);
  }

  getColumnSize(): number {
    const activeColumns = this.columns.filter(c => c.state).length;
    return activeColumns > 0 ? Math.floor(12 / activeColumns) : 12;
  }


  groupOrders() {
    this.groupedOrders = {};
    for (const column of this.columns) {
      this.groupedOrders[column.key] = this.filteredOrders.filter(o => o.status === column.key);
    }
    this.connectedDropLists = this.columns.map(c => c.key);
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
    this.orderService.setEditOrder(order);
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

  async drop(event: CdkDragDrop<OrderChicken[]>, targetColumnKey: string) {

    // gleiches Drop-List → nur Reihenfolge ändern
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const movedOrder = event.container.data[event.currentIndex];

    movedOrder.status = targetColumnKey as OrderStatus;

    if (targetColumnKey === 'CHECKED_IN' && !movedOrder.checked_in_at) {
      movedOrder.checked_in_at = new Date().toISOString();
    }

    if (movedOrder.id) {
      console.table(movedOrder)
      this.orderService.updateOrder(movedOrder.id, movedOrder).subscribe({
        next: (response) => {
          if (response.success) {
            console.log(
              `Order ${movedOrder.id} in Status ${targetColumnKey} verschoben`
            );
          }
        },
        error: (err) => console.error('Update-Fehler', err),
      });
    }

    this.groupOrders();
  }


  openSelect(order: OrderChicken) {
    const index = this.filteredOrders.indexOf(order);
    const select = this.selectRefs.get(index);
    select?.open();
  }

  openSelectKanban(order: OrderChicken, columnKey: string) {
    const index = this.groupedOrders[columnKey].indexOf(order);
    const select = this.selectRefsKanban.get(index);
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
