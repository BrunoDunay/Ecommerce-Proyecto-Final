import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../toast/toast.service';
import { Observable, map, tap } from 'rxjs';
import { WishList, wishListSchema } from '../../types/Wishlist';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private baseUrl = `${environment.BACK_URL}/wishlist`;

  constructor(
    private http: HttpClient,
    private toast: ToastService
  ) {}

  getUserWishlist(): Observable<WishList> {
    return this.http
      .get<{ message: string; count: number; wishList: unknown }>(this.baseUrl)
      .pipe(
        map((res) => {
          const parsed = wishListSchema.safeParse(res.wishList);
          if (!parsed.success) {
            console.error('Error parseando wishlist', parsed.error);
            throw new Error('Invalid wishList response');
          }
          return parsed.data;
        })
      );
  }

  checkProductInWishlist(productId: string): Observable<boolean> {
    return this.http
      .get<{ message: string; inWishList: boolean }>(
        `${this.baseUrl}/check/${productId}`
      )
      .pipe(map((res) => res.inWishList));
  }

  addToWishlist(productId: string): Observable<WishList> {
    return this.http
      .post<{ message: string; wishList: unknown }>(
        `${this.baseUrl}/add`,
        { productId }
      )
      .pipe(
        map((res) => {
          const parsed = wishListSchema.safeParse(res.wishList);
          if (!parsed.success) {
            console.error('Error parseando wishlist (add)', parsed.error);
            throw new Error('Invalid wishList response');
          }
          return parsed.data;
        }),
        tap(() => {
          this.toast.success('Producto añadido a tu lista de deseos');
        })
      );
  }

  removeFromWishlist(productId: string): Observable<WishList> {
    return this.http
      .delete<{ message: string; wishList: unknown }>(
        `${this.baseUrl}/remove/${productId}`
      )
      .pipe(
        map((res) => {
          const parsed = wishListSchema.safeParse(res.wishList);
          if (!parsed.success) {
            console.error('Error parseando wishlist (remove)', parsed.error);
            throw new Error('Invalid wishList response');
          }
          return parsed.data;
        }),
        tap(() => {
          this.toast.success('Producto eliminado de tu lista de deseos');
        })
      );
  }

  clearWishlist(): Observable<WishList> {
    return this.http
      .delete<{ message: string; wishList: unknown }>(
        `${this.baseUrl}/clear`
      )
      .pipe(
        map((res) => {
          const parsed = wishListSchema.safeParse(res.wishList);
          if (!parsed.success) {
            console.error('Error parseando wishlist (clear)', parsed.error);
            throw new Error('Invalid wishList response');
          }
          return parsed.data;
        }),
        tap(() => {
          this.toast.success('Lista de deseos vaciada');
        })
      );
  }
}
