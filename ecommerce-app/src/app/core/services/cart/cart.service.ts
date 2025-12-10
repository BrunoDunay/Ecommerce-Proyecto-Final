import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Cart, cartSchema } from '../../types/Cart';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';
import { Store } from '@ngrx/store';
import { selectUserId } from '../../store/auth/auth.selectors';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private baseUrl = `${environment.BACK_URL}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private toast: ToastService,
    private store: Store
  ) {
    this.loadUserCart();
  }

  getUserId(): string {
    let userId: string = '';
    this.store
      .select(selectUserId)
      .pipe(take(1))
      .subscribe({
        next: (id) => (userId = id ?? ''),
      });
    return userId;
  }

  getCartByUserId(userId: string): Observable<Cart | null> {
    return this.httpClient.get(`${this.baseUrl}/user/${userId}`).pipe(
      map((data: any) => {
        // 🧹 Limpiar productos con product === null
        if (Array.isArray(data?.products)) {
          data = {
            ...data,
            products: data.products.filter(
              (item: any) => item && item.product !== null
            ),
          };
        }

        const response = cartSchema.safeParse(data);
        if (!response.success) {
          console.error('Error al parsear el carrito', response.error);
          throw response.error;
        }
        return response.data;
      })
    );
  }

  loadUserCart() {
    const id = this.getUserId();
    if (!id) {
      this.cartSubject.next(null);
      return;
    }

    this.getCartByUserId(id).subscribe({
      next: (cart) => {
        this.cartSubject.next(cart);
      },
      error: (error) => {
        console.error('Error al cargar el carrito del usuario', error);
        this.cartSubject.next(null);
      },
    });
  }

  addToCart(productId: string, quantity: number = 1): Observable<Cart | null> {
    const userId = this.getUserId();
    if (!userId) {
      console.log('usuario no autentificado');
      this.toast.error('Debes iniciar sesión para agregar productos al carrito');
      return of(null);
    }

    const payload = {
      userId,
      productId,
      quantity,
    };

    return this.httpClient.post(`${this.baseUrl}/add-product`, payload).pipe(
      switchMap(() => this.getCartByUserId(userId)),
      tap((updatedCart) => {
        this.cartSubject.next(updatedCart);
        this.toast.success('Producto agregado al carrito');
      }),
      catchError((error) => {
        console.error('Error al agregar al carrito', error);
        this.toast.error('No se pudo agregar el producto al carrito');
        return of(null);
      })
    );
  }

  removeFromCart(productId: string): Observable<Cart | null> {
    const userId = this.getUserId();
    if (!userId) {
      console.log('usuario no autentificado');
      this.toast.error('Debes iniciar sesión para modificar el carrito');
      return of(null);
    }

    const payload = {
      userId,
      productId,
    };

    return this.httpClient
      .delete(`${this.baseUrl}/remove-product`, { body: payload })
      .pipe(
        switchMap(() => this.getCartByUserId(userId)),
        tap((updatedCart) => {
          this.cartSubject.next(updatedCart);
          this.toast.success('Producto eliminado del carrito');
        }),
        catchError((error) => {
          console.error('Error al eliminar del carrito', error);
          this.toast.error('No se pudo eliminar el producto del carrito');
          // Devolvemos el estado actual para no romper la UI
          return of(this.cartSubject.value);
        })
      );
  }

  clearCart(): Observable<Cart | null> {
    const cartId = this.cartSubject.value?._id;
    if (!cartId) {
      return of(null);
    }

    return this.httpClient.delete(`${this.baseUrl}/${cartId}`).pipe(
      tap(() => {
        this.cartSubject.next(null);
        this.toast.success('Carrito eliminado');
      }),
      map(() => null),
      catchError((error) => {
        console.error('Error al vaciar el carrito', error);
        this.toast.error('No se pudo vaciar el carrito');
        return of(this.cartSubject.value);
      })
    );
  }

  getItemCount(): Observable<number> {
    return this.cart$.pipe(
      map((cart) => {
        if (!cart || cart.products.length === 0) {
          return 0;
        }
        return cart.products.reduce(
          (total, item) => total + item.quantity,
          0
        );
      })
    );
  }

  getCartTotal(): Observable<number> {
    return this.cart$.pipe(
      map((cart) => {
        if (!cart || cart.products.length === 0) {
          return 0;
        }
        return cart.products.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      })
    );
  }
}
