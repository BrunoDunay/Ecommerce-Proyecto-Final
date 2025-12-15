import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Product, ProductResponse } from '../../types/Products';
import { environment } from '../../../../environments/environment';

export type filters = {
  q: string;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
};

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private baseUrl = `${environment.BACK_URL}/products`;
  private categoriesUrl = `${environment.BACK_URL}/categories`;

  constructor(private httpClient: HttpClient) {}

  getProducts(page: number = 1, limit: number = 10) {
    return this.httpClient
      .get<ProductResponse>(this.baseUrl, { params: { page, limit } })
      .pipe(catchError((error) => throwError(() => new Error(error))));
  }

  getProductByID(id: string): Observable<Product> {
    return this.httpClient.get<Product>(`${this.baseUrl}/${id}`);
  }

  getProductsByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 1
  ) {
    return this.httpClient.get<ProductResponse>(
      `${this.baseUrl}/category/${categoryId}`,
      { params: { page, limit } }
    );
  }

  updateProduct(id: string, data: any) {
    return this.httpClient.put(`${this.baseUrl}/${id}`, data);
  }

  deleteProduct(id: string) {
    return this.httpClient.delete(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<any[]> {
    return this.httpClient
      .get<any>(this.categoriesUrl)
      .pipe(
        map((data) => (Array.isArray(data) ? data : data.categories ?? []))
      );
  }

  createCategory(data: { name: string; description: string }) {
    return this.httpClient.post<any>(this.categoriesUrl, data);
  }

  deleteCategory(id: string) {
    return this.httpClient.delete(`${this.categoriesUrl}/${id}`);
  }

  searchProducts(searchConfig: filters): Observable<Product[]> {
    let filtersReq: filters = {
      q: searchConfig.q,
    };

    if (searchConfig.minPrice) {
      filtersReq.minPrice = searchConfig.minPrice;
    }
    if (searchConfig.maxPrice) {
      filtersReq.maxPrice = searchConfig.maxPrice;
    }

    const params = new HttpParams({ fromObject: filtersReq });

    return this.httpClient
      .get<ProductResponse>(`${this.baseUrl}/search`, { params })
      .pipe(
        map((response) => {
          return response.products;
        })
      );
  }
}
