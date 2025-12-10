import { Component, computed, signal } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { of, Observable, take } from 'rxjs';

import { Cart } from '../../../core/types/Cart';
import { PaymentMethod } from '../../../core/types/PaymentMethod';
import { Order } from '../../../core/types/Order';
import { PaymentService } from '../../../core/services/paymentMethods/payment-methods.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { OrderService } from '../../../core/services/order/order.service';
import { ToastService } from '../../../core/services/toast/toast.service';

import { Store } from '@ngrx/store';
import { selectUserId } from '../../../core/store/auth/auth.selectors';

import { PaymentMethodsListComponent } from '../../../components/payment/payment-methods-list/payment-methods-list.component';
import { ShippingAddressListComponent } from '../../../components/shipping/shipping-address-list/shipping-address-list.component';
import { ShippingAddress } from '../../../core/types/ShippingAddress';
import { ShippingAddressService } from '../../../core/services/shippingAddress/shipping-address.service';

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [
    PaymentMethodsListComponent,
    ShippingAddressListComponent,
    AsyncPipe,
    CurrencyPipe,
    RouterLink,
  ],
  templateUrl: './check-out.component.html',
  styleUrl: './check-out.component.css',
})
export class CheckOutComponent {
  cartSig = signal<Cart | null>(null);
  LoadingSig = signal(false);
  errorMsg = signal<string | null>(null);

  paymentMethods$: Observable<PaymentMethod[]> = of([]);
  addresses$: Observable<ShippingAddress[]> = of([]);

  paymentMethodId: string = '';
  shippingAddressId: string = '';

  total = computed(
    () =>
      this.cartSig()?.products.reduce(
        (acc, p) => acc + p.product.price * p.quantity,
        0
      ) || 0
  );

  constructor(
    private paymentService: PaymentService,
    private cartService: CartService,
    private store: Store,
    private orderservice: OrderService,
    private router: Router,
    private toast: ToastService,
    private shippingAddressService: ShippingAddressService
  ) {}

  ngOnInit(): void {
    const userId = this.getUserId();
    if (!userId) {
      this.errorMsg.set('Debes iniciar sesión para continuar con el checkout.');
      return;
    }

    // carrito
    this.cartService.cart$.subscribe((cart) => this.cartSig.set(cart));

    // métodos de pago
    this.paymentService.loadPayMethods();
    this.paymentMethods$ = this.paymentService.paymentMethods$;

    // direcciones de envío
    this.shippingAddressService.loadAddresses();
    this.addresses$ = this.shippingAddressService.addresses$;
  }

  onPaymentMethodSelected(id: string) {
    this.paymentMethodId = id;
    this.errorMsg.set(null);
  }

  onShippingSelected(id: string) {
    this.shippingAddressId = id;
    this.errorMsg.set(null);
  }

  submitOrder() {
    const cart = this.cartSig();
    const user = this.getUserId();

    if (!cart || !user) {
      this.errorMsg.set('No hay información suficiente para generar la orden.');
      return;
    }

    if (!this.shippingAddressId) {
      this.errorMsg.set('Selecciona una dirección de envío.');
      this.toast.error('Selecciona una dirección de envío');
      return;
    }

    if (!this.paymentMethodId) {
      this.errorMsg.set('Selecciona un método de pago.');
      this.toast.error('Selecciona un método de pago');
      return;
    }

    this.LoadingSig.set(true);
    this.errorMsg.set(null);

    const orderPayload = {
      user,
      products: cart.products.map((p) => ({
        productId: p.product._id,
        quantity: p.quantity,
        price: p.product.price,
      })),
      totalPrice: this.total(),
      status: 'pending',
      shippingAddress: this.shippingAddressId,   // 👈 usamos la dirección seleccionada
      paymentMethod: this.paymentMethodId,       // 👈 usamos el método seleccionado
      shippingCost: 0,
    } as unknown as Order;

    this.orderservice.createOrder(orderPayload).subscribe({
      next: () => {
        this.cartService.clearCart().subscribe(() => {
          this.cartSig.set(null);
          this.LoadingSig.set(false);
          this.router.navigateByUrl('/thank-you-page');
        });
      },
      error: (error) => {
        console.log(error);
        this.LoadingSig.set(false);
        this.errorMsg.set('No se pudo generar la compra.');
        this.toast.error('No se pudo generar la compra');
      },
    });
  }

  private getUserId() {
    let id = '';
    this.store
      .select(selectUserId)
      .pipe(take(1))
      .subscribe((userId) => (id = userId ?? ''));
    return id;
  }
}
