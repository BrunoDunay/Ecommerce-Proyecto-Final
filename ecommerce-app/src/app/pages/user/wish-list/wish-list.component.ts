import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { WishlistService } from '../../../core/services/wishList/wish-list.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { WishList } from '../../../core/types/Wishlist';
import { getFinalPrice } from '../../../core/utils/pricing';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.css',
})
export class WishlistComponent implements OnInit {
  wishlist: WishList | null = null;
  loading = true;

  // para spinners individuales
  removingIds = new Set<string>();
  addingToCartIds = new Set<string>();

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  /**
   * Wrapper para usar el util de pricing
   */
  getFinalPrice(product: { price: number; offer?: number | null }) {
    return getFinalPrice(product);
  }

  /**
   * Cargar wishlist del usuario
   */
  private loadWishlist(): void {
    this.loading = true;

    this.wishlistService
      .getUserWishlist()
      .pipe(take(1))
      .subscribe({
        next: (wl) => {
          this.wishlist = wl;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando wishlist', err);
          this.wishlist = null;
          this.loading = false;
        },
      });
  }

  get hasItems(): boolean {
    return !!this.wishlist?.products?.length;
  }

  /**
   * Quitar producto de wishlist
   */
  removeItem(productId: string): void {
    if (this.removingIds.has(productId)) return;

    this.removingIds.add(productId);

    this.wishlistService
      .removeFromWishlist(productId)
      .pipe(take(1))
      .subscribe({
        next: (wl) => {
          this.wishlist = wl;
          this.removingIds.delete(productId);
        },
        error: (err) => {
          console.error('Error eliminando de wishlist', err);
          this.removingIds.delete(productId);
        },
      });
  }

  /**
   * Pasar un producto al carrito y quitarlo de wishlist
   */
  addToCart(productId: string): void {
    if (this.addingToCartIds.has(productId)) return;

    this.addingToCartIds.add(productId);

    this.cartService
      .addToCart(productId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.addingToCartIds.delete(productId);
          this.removeItem(productId);
        },
        error: (err) => {
          console.error('Error agregando al carrito desde wishlist', err);
          this.addingToCartIds.delete(productId);
        },
      });
  }

  isRemoving(productId: string): boolean {
    return this.removingIds.has(productId);
  }

  isAddingToCart(productId: string): boolean {
    return this.addingToCartIds.has(productId);
  }

  /**
   * Vaciar wishlist completa
   */
  clearAll(): void {
    if (!this.hasItems) return;

    this.wishlistService
      .clearWishlist()
      .pipe(take(1))
      .subscribe({
        next: (wl) => {
          this.wishlist = wl;
        },
        error: (err) => {
          console.error('Error vaciando wishlist', err);
        },
      });
  }
}
