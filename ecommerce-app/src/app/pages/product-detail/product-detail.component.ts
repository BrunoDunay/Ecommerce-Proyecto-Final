import { Component, OnInit } from '@angular/core';
import { Product } from '../../core/types/Products';
import { ProductsService } from '../../core/services/products/products.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { CartService } from '../../core/services/cart/cart.service';
import { WishlistService } from '../../core/services/wishList/wish-list.service';
import { take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserId } from '../../core/store/auth/auth.selectors';
import { ToastService } from '../../core/services/toast/toast.service';
import { getFinalPrice } from '../../core/utils/pricing';

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
  isLoggedIn: boolean = false; 

  get hasOffer(): boolean {
    return !!this.product && !!this.product.offer && this.product.offer > 0;
  }

  get discountedPrice(): number {
    if (!this.product) return 0;
    return getFinalPrice(this.product);
  }

  constructor(
    private productService: ProductsService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private store: Store,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectUserId)
      .pipe(take(1))
      .subscribe((userId) => {
        this.isLoggedIn = !!userId;
      });

    this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        if (!id) return;

        this.productService.getProductByID(id).subscribe({
          next: (product) => {
            this.product = product;

            if (!this.isLoggedIn) {
              this.inWishlist = false;
              return;
            }

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


  onWishlistClick() {
    if (!this.isLoggedIn) {
      this.toast.error('Debes iniciar sesión para usar la lista de deseos');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.toggleWishlist();
  }

  private toggleWishlist() {
    if (!this.product?._id || this.wishlistLoading) return;

    this.wishlistLoading = true;

    const request$ = this.inWishlist
      ? this.wishlistService.removeFromWishlist(this.product._id)
      : this.wishlistService.addToWishlist(this.product._id);

    request$.pipe(take(1)).subscribe({
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
