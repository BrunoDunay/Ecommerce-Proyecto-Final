import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductsService } from '../../../core/services/products/products.service';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/types/Products';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './products.component.html'
})
export class AdminProductsComponent implements OnInit {

  products: Product[] = [];
  loading = true;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.productsService.getProducts(1, 50).subscribe({
      next: (res) => {
        this.products = res.products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.loading = false;
      }
    });
  }
}
