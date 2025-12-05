import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products/products.service';
import { Product } from '../../core/types/Products';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  products: Product[] = [];
  loading = true;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.productsService.getProducts(1, 32).subscribe({
      next: (res) => {
        // Primero descuento mayor y luego precio menor
        const sorted = [...res.products].sort((a, b) => {
          if (b.offer !== a.offer) return b.offer - a.offer;
          // si tienen el mismo offer, ordena por precio ascendente
          return a.price - b.price;
        });
        this.products = sorted.slice(0, 10);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.loading = false;
      }
    });
  }
}
