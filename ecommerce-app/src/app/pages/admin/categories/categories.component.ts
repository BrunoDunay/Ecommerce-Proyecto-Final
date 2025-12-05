import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../core/services/products/products.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html'
})
export class AdminCategoriesComponent implements OnInit {

  categories: any[] = [];
  loading = true;

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
