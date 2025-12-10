import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { PaymentMethod, PaymentMethodArraySchema } from '../../types/PaymentMethod';
import { ToastService } from '../toast/toast.service';
import { Store } from '@ngrx/store';
import { selectUserId } from '../../store/auth/auth.selectors';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  // private baseUrl = `http://localhost:3000/api/payment-methods`;
  private baseUrl = `${environment.BACK_URL}/payment-methods`;
  private paymentMethodSubject = new BehaviorSubject<PaymentMethod | null>(null);
  private paymentMethodListSubject = new BehaviorSubject<PaymentMethod[]>([]);
  paymentMethod$ = this.paymentMethodSubject.asObservable();
  paymentMethods$ = this.paymentMethodListSubject.asObservable();

  constructor(
    private http: HttpClient,
    private store: Store,
    private toast: ToastService
  ) {
    this.loadPayMethods();
  }

  getUserId() {
    let id = '';
    this.store
      .select(selectUserId)
      .pipe(take(1))
      .subscribe((userId) => (id = userId ?? ''));

    return id;
  }

  loadPayMethods() {
    const id = this.getUserId()
    console.log('Loading payment methods for user ID:', id);
    if (!id) {
      console.log('No user ID found, setting empty array');
      this.paymentMethodListSubject.next([]);
      return;
    }
    this.getPayMethodbyUser(id).subscribe({
      next: (data) => {
        console.log('Payment methods loaded:', data);
        this.paymentMethodListSubject.next(data);
      },
      error: (error) => {
        console.error('Error loading payment methods:', error);
        this.paymentMethodListSubject.next([]);
      },
    });
  }

  getPayMethodbyUser(id: string): Observable<PaymentMethod[]> {
    return this.http.get(`${this.baseUrl}/user/${id}`).pipe(
      map((data) => {
        const response = PaymentMethodArraySchema.safeParse(data);
        if (!response.success) {
          console.log(response.error);
          return [];
        }

        return response.data;
      })
    );
  }
  addPaymentMethod(payment: PaymentMethod): Observable<PaymentMethod[]> {
    const id = this.getUserId();
    if (!id) {
      return of([]);
    }
    const data = { ...payment, user: id };
    return this.http.post(`${this.baseUrl}`, data).pipe(
      switchMap(() => this.getPayMethodbyUser(id)),
      tap((udatedPayments) => {
        this.toast.success('metodo de pago agregado');
        this.paymentMethodListSubject.next(udatedPayments);
      })
    );
  }

  editPaymentMethod(payment: PaymentMethod) {
    const id = this.getUserId()
    if (!id) {
      return of([]);
    }
    return this.http.put(`${this.baseUrl}/${payment._id}`, payment).pipe(
      switchMap(() => this.getPayMethodbyUser(id)),
      tap((udatedPayments) => {
        this.toast.success('metodo de pago actualizado');
        this.paymentMethodListSubject.next(udatedPayments);
      })
    );
  }

  deletePaymentMethod(id: string) {
    const userId = this.getUserId()
    if (!userId) {
      return of([]);
    }
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      switchMap(() => this.getPayMethodbyUser(userId)),
      tap((udatedPayments) => {
        this.toast.success('metodo pago eliminado');
      
        this.paymentMethodListSubject.next(udatedPayments ?? []);
      }),
      catchError(error => {
        console.error('Error deleting payment method:', error);
        this.paymentMethodListSubject.next([]);
        return of([]);
      })
    );
  }
}
