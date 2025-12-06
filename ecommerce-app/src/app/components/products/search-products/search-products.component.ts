import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products/products.service';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  Observable,
  of
} from 'rxjs';
import {
  AsyncPipe,
  CommonModule
} from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Store } from '@ngrx/store';
import { selectDecodedToken } from '../../../core/store/auth/auth.selectors';
import { decodedToken } from '../../../core/types/Token';
import { Product } from '../../../core/types/Products';

@Component({
  selector: 'app-search-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './search-products.component.html',
  styleUrl: './search-products.component.css'
})
export class SearchProductsComponent implements OnInit {

  // solo buscamos por q
  searchProductForm = new FormGroup({
    q: new FormControl('', { nonNullable: true })
  });

  // igual que antes: config observable
  searchConfig$ = this.searchProductForm.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged((prev, curr) => {
      return prev.q === curr.q;
    }),
    map((config) => {
      const trimmedConfig = {
        q: config.q?.trim() || ''
      };
      localStorage.setItem('searchConfig', JSON.stringify(trimmedConfig));
      return trimmedConfig;
    })
  );

  // igual que antes: products$
  products$: Observable<Product[]> = this.searchConfig$.pipe(
    switchMap((searchConfigObservable) =>
      this.productService.searchProducts(searchConfigObservable as any)
    )
  );

  // para mostrar "Mi perfil"
  user$: Observable<decodedToken | null> = of(null);

  constructor(
    private productService: ProductsService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.user$ = this.store.select(selectDecodedToken);

    // debug opcional
    this.searchConfig$.subscribe({
      next: (data) => console.log('searchConfig', data)
    });
  }
}
