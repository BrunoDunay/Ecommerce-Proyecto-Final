import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { selectUserId } from '../../store/auth/auth.selectors';
import { Cart, cartSchema } from '../../types/Cart';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { getFinalPrice } from '../../utils/pricing';

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = `${environment.BACK_URL}/cart`;

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private toast: ToastService,
    private store: Store
  ) {}

  initCartListener(): void {
    this.store.select(selectUserId).pipe(
      distinctUntilChanged(),
      switchMap((userId) => {
        if (!userId) {
          this.cartSubject.next(null);
          return of(null);
        }
        return this.getCartByUserId(userId).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe((cart) => this.cartSubject.next(cart));
  }

  getCartByUserId(userId: string): Observable<Cart | null> {
    return this.httpClient.get(`${this.baseUrl}/user/${userId}`).pipe(
      map((data: any) => {
        if (Array.isArray(data?.products)) {
          data = { ...data, products: data.products.filter((item: any) => item && item.product !== null) };
        }
        const response = cartSchema.safeParse(data);
        if (!response.success) throw response.error;
        return response.data;
      }),
      catchError((err) => {
        if (err?.status === 404) return of(null);
        return of(null);
      })
    );
  }

  private userId$(): Observable<string> {
    return this.store.select(selectUserId).pipe(
      take(1),
      map((id) => id ?? '')
    );
  }

  addToCart(productId: string, quantity: number = 1): Observable<Cart | null> {
    return this.userId$().pipe(
      switchMap((userId) => {
        if (!userId) {
          this.toast.error('Debes iniciar sesión para agregar productos al carrito');
          return of(null);
        }
        const payload = { userId, productId, quantity };
        return this.httpClient.post(`${this.baseUrl}/add-product`, payload).pipe(
          switchMap(() => this.getCartByUserId(userId)),
          tap((updatedCart) => {
            this.cartSubject.next(updatedCart);
            this.toast.success('Producto agregado al carrito');
          }),
          catchError(() => {
            this.toast.error('No se pudo agregar el producto al carrito');
            return of(null);
          })
        );
      })
    );
  }

  removeFromCart(productId: string): Observable<Cart | null> {
    return this.userId$().pipe(
      switchMap((userId) => {
        if (!userId) {
          this.toast.error('Debes iniciar sesión para modificar el carrito');
          return of(null);
        }
        const payload = { userId, productId };
        return this.httpClient.delete(`${this.baseUrl}/remove-product`, { body: payload }).pipe(
          switchMap(() => this.getCartByUserId(userId)),
          tap((updatedCart) => {
            this.cartSubject.next(updatedCart);
            this.toast.success('Producto eliminado del carrito');
          }),
          catchError(() => {
            this.toast.error('No se pudo eliminar el producto del carrito');
            return of(this.cartSubject.value);
          })
        );
      })
    );
  }

  clearCart(): Observable<Cart | null> {
    const cartId = this.cartSubject.value?._id;
    if (!cartId) return of(null);

    return this.httpClient.delete(`${this.baseUrl}/${cartId}`).pipe(
      tap(() => {
        this.cartSubject.next(null);
        this.toast.success('Carrito eliminado');
      }),
      map(() => null),
      catchError(() => of(this.cartSubject.value))
    );
  }

  getItemCount(): Observable<number> {
    return this.cart$.pipe(
      map((cart) => cart?.products?.reduce((t, i) => t + i.quantity, 0) ?? 0)
    );
  }

  getCartTotal(): Observable<number> {
    return this.cart$.pipe(
      map((cart) => cart ? cart.products.reduce((acc, item) => acc + getFinalPrice(item.product) * item.quantity, 0) : 0)
    );
  }
}
