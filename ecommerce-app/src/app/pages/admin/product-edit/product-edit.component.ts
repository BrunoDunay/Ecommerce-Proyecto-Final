import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../../core/services/products/products.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/types/Products';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-edit.component.html'
})
export class ProductEditComponent implements OnInit {

  form!: FormGroup;
  productId!: string;

  categories: any[] = [];
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.buildForm();
    this.loadCategories();
    this.loadProductData();
  }

  buildForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      stock: ['', Validators.required],
      category: ['', Validators.required],
      offer: [0],
      imageUrl: ['']
    });
  }

  loadCategories() {
    this.productsService.getCategories().subscribe({
      next: (cats) => {
        console.log('CATEGORIES:', cats);
        this.categories = cats;
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.categories = [];
      }
    });
  }

  loadProductData() {
    this.productsService.getProductByID(this.productId).subscribe((product: Product) => {
      this.form.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        offer: product.offer ?? 0,
        category: product.category._id
      });
    });
  }

  updateProduct() {
    if (this.form.invalid) return;

    this.loading = true;

    const raw = this.form.value;

    const payload = {
      name: raw.name,
      description: raw.description,
      price: Number(raw.price),
      stock: Number(raw.stock),
      imageUrl: raw.imageUrl,
      category: raw.category,
      offer: raw.offer === '' || raw.offer == null ? 0 : Number(raw.offer),
    };

    console.log('PAYLOAD A ENVIAR:', payload);

    this.productsService.updateProduct(this.productId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products-list']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al actualizar', err);
      }
    });
  }
}
