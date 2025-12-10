// src/app/pages/product-detail/product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { Product } from '../../core/types/Products';
import { ProductsService } from '../../core/services/products/products.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { CartService } from '../../core/services/cart/cart.service';
import { WishlistService } from '../../core/services/wishList/wish-list.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, NgClass],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;

  loading: boolean = false;

  inWishlist: boolean = false;
  wishlistLoading: boolean = false;

  constructor(
    private productService: ProductsService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        if (!id) return;

        this.productService.getProductByID(id).subscribe({
          next: (product) => {
            this.product = product;

            this.wishlistService
              .checkProductInWishlist(product._id)
              .pipe(take(1))
              .subscribe({
                next: (inList) => {
                  this.inWishlist = inList;
                },
                error: (err) => {
                  console.error('Error comprobando wishlist', err);
                  this.inWishlist = false;
                },
              });
          },
          error: (error) => {
            console.error('Error al cargar producto', error);
            this.product = null;
          },
        });
      },
    });
  }

  addToCart() {
    if (!this.product?._id) return;

    this.loading = true;
    this.cartService
      .addToCart(this.product._id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al agregar desde el detalle', error);
          this.loading = false;
        },
      });
  }

  toggleWishlist() {
    if (!this.product?._id || this.wishlistLoading) return;

    this.wishlistLoading = true;

    const request$ = this.inWishlist
      ? this.wishlistService.removeFromWishlist(this.product._id)
      : this.wishlistService.addToWishlist(this.product._id);

    request$
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.inWishlist = !this.inWishlist;
          this.wishlistLoading = false;
        },
        error: (error) => {
          console.error('Error al actualizar wishlist', error);
          this.wishlistLoading = false;
        },
      });
  }
}
