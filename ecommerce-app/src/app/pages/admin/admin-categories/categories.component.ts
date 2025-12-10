import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../core/services/products/products.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html'
})
export class AdminCategoriesComponent implements OnInit {

  categories: any[] = [];
  loading = true;

  newCategoryForm!: FormGroup;
  creating = false;
  deletingId: string | null = null;

  private fb = inject(FormBuilder);

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.newCategoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });

    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.productService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  addCategory() {
    if (this.newCategoryForm.invalid) return;

    this.creating = true;
    const { name, description } = this.newCategoryForm.value;

    this.productService.createCategory({ name, description }).subscribe({
      next: (created) => {
        this.categories = [created, ...this.categories];
        this.newCategoryForm.reset();
        this.creating = false;
      },
      error: (err) => {
        console.error('Error creando categoría', err);
        this.creating = false;
      }
    });
  }

  deleteCategory(id: string) {
  this.deletingId = id;

  this.productService.getProductsByCategory(id, 1, 1).subscribe({
    next: (res) => {
      const total = res.pagination?.totalResults ?? 0;

      if (total > 0) {
        // no borrar si hay productos asociados
        this.deletingId = null;
        alert(
          `No puedes eliminar esta categoría porque tiene ${total} producto(s) asociados.\n` +
          `Primero reasigna o elimina esos productos.`
        );
        return;
      }

      // Si no hay productos se pide confirmación
      const confirmed = confirm(
        '¿Seguro que quieres eliminar esta categoría?\nEsta acción no se puede deshacer.'
      );
      if (!confirmed) {
        this.deletingId = null;
        return;
      }

      // Procede a eliminar categoría
      this.productService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c._id !== id);
          this.deletingId = null;
        },
        error: (err) => {
          console.error('Error eliminando categoría', err);
          this.deletingId = null;
        }
      });
    },
    error: (err) => {
      console.error('Error revisando productos de la categoría', err);
      this.deletingId = null;
      alert('No se pudo verificar si la categoría tiene productos. Intenta más tarde.');
    }
  });
}

}
