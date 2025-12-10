import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  of,
  switchMap,
  tap,
  catchError,
  map,
} from 'rxjs';
import {
  ShippingAddress,
  shippingAddressArraySchema,
  CreateShippingAddress,
  UpdateShippingAddress,
} from '../../types/ShippingAddress';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShippingAddressService {
  private baseUrl = `${environment.BACK_URL}/shipping-address`;

  private addressesSubject = new BehaviorSubject<ShippingAddress[]>([]);
  addresses$ = this.addressesSubject.asObservable();

  constructor(private http: HttpClient, private toast: ToastService) {
    this.loadAddresses();
  }

  /** Cargar todas las direcciones del usuario */
  loadAddresses(): void {
    this.http
      .get<{ message: string; count: number; addresses: ShippingAddress[] }>(
        this.baseUrl
      )
      .pipe(
        map((res) => {
          const parsed = shippingAddressArraySchema.safeParse(res.addresses);
          if (!parsed.success) {
            console.error(parsed.error);
            return [];
          }
          return parsed.data;
        }),
        catchError((err) => {
          console.error('Error loading addresses', err);
          return of<ShippingAddress[]>([]);
        })
      )
      .subscribe((addresses) => this.addressesSubject.next(addresses));
  }

  /** Crear nueva dirección */
  addAddress(payload: CreateShippingAddress): Observable<ShippingAddress[]> {
    return this.http
      .post<{ message: string; address: ShippingAddress }>(
        this.baseUrl,
        payload
      )
      .pipe(
        switchMap(() => this.reload()),
        tap(() => this.toast.success('Dirección agregada')),
      );
  }

  /** Editar dirección existente */
  editAddress(payload: UpdateShippingAddress): Observable<ShippingAddress[]> {
    return this.http
      .put<{ message: string; address: ShippingAddress }>(
        `${this.baseUrl}/${payload._id}`,
        payload
      )
      .pipe(
        switchMap(() => this.reload()),
        tap(() => this.toast.success('Dirección actualizada')),
      );
  }

  /** Eliminar dirección */
  deleteAddress(id: string): Observable<ShippingAddress[]> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/${id}`)
      .pipe(
        switchMap(() => this.reload()),
        tap(() => this.toast.success('Dirección eliminada')),
        catchError((err) => {
          console.error('Error deleting address', err);
          return of<ShippingAddress[]>([]);
        })
      );
  }

  /** Marcar como predeterminada */
  setDefault(id: string): Observable<ShippingAddress[]> {
    return this.http
      .patch<{ message: string; address: ShippingAddress }>(
        `${this.baseUrl}/${id}/default`,
        {}
      )
      .pipe(
        switchMap(() => this.reload()),
        tap(() => this.toast.success('Dirección predeterminada actualizada')),
      );
  }
  /** Actualizar la lista */
  private reload(): Observable<ShippingAddress[]> {
    return this.http
      .get<{ message: string; count: number; addresses: ShippingAddress[] }>(
        this.baseUrl
      )
      .pipe(
        map((res) => {
          const parsed = shippingAddressArraySchema.safeParse(res.addresses);
          if (!parsed.success) {
            console.error(parsed.error);
            return [];
          }
          return parsed.data;
        }),
        tap((addresses) => this.addressesSubject.next(addresses)),
      );
  }
}
