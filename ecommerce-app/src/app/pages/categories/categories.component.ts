import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { ProductsService } from '../../core/services/products/products.service';
import { Category } from '../../core/types/Category';
import { ProductResponse } from '../../core/types/Products';
import { ProductsCardComponent } from '../../components/products/products-card/products-card.component';
import { PlaceholderComponent } from '../../components/shared/placeholder/placeholder.component';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, ProductsCardComponent, PlaceholderComponent, MatPaginatorModule],
  templateUrl: './categories.component.html',
})
export class CategoriesPageComponent implements OnInit {
  categories: Category[] = [];

  loadingCategories = true;
  errorMsg = '';

  productResponse!: ProductResponse;

  selectedCategoryId: string = 'ALL';
  selectedCategoryName: string = 'Todas';

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllProducts(); // carga inicial
  }

  loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (data: any[]) => {
        this.categories = data as Category[];
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'No se pudieron cargar las categorías';
        this.loadingCategories = false;
      },
    });
  }

  loadAllProducts(page = 1, limit = 16): void {
    this.productsService.getProducts(page, limit).subscribe({
      next: (data) => (this.productResponse = data),
      error: (err) => console.error(err),
    });
  }

  loadProductsByCategory(categoryId: string, page = 1, limit = 16): void {
    this.productsService.getProductsByCategory(categoryId, page, limit).subscribe({
      next: (data) => (this.productResponse = data),
      error: (err) => console.error(err),
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategoryId = categoryId;

    if (categoryId === 'ALL') {
      this.selectedCategoryName = 'Todas';
      this.loadAllProducts(1, 16);
      return;
    }

    const cat = this.categories.find(c => c._id === categoryId);
    this.selectedCategoryName = cat?.name ?? 'Categoría';

    this.loadProductsByCategory(categoryId, 1, 16);
  }

  onPageChange(event: PageEvent): void {
    const page = event.pageIndex + 1; // paginator base 0
    const limit = event.pageSize;

    if (this.selectedCategoryId === 'ALL') {
      this.loadAllProducts(page, limit);
    } else {
      this.loadProductsByCategory(this.selectedCategoryId, page, limit);
    }
  }

  get skeletonArray(): number[] {
    const expectedCount = this.productResponse?.products?.length || 8;
    return Array(expectedCount).fill(0);
  }

  retry(): void {
    this.selectCategory(this.selectedCategoryId);
  }
}
