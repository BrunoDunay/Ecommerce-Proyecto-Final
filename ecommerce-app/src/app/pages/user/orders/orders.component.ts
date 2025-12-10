import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { Order } from '../../../core/types/Order';
import { OrderService } from '../../../core/services/order/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, NgClass, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  orders$!: Observable<Order[]>;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.loadOrders();
    this.orders$ = this.orderService.$order;
  }

  getStatusLabel(status: Order['status']): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'En proceso';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getStatusClasses(status: Order['status']): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getOrderCode(order: Order): string {
    if (!order._id) return '';
    return order._id.slice(-6).toUpperCase();
  }

  getItemsCount(order: Order): number {
    return order.products.reduce((acc, p) => acc + p.quantity, 0);
  }
}
