import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Payment } from '../types/payment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
    constructor(private http: HttpClient) {}

  private readonly BASE_URL = 'http://localhost:3000/api/payments';


  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.BASE_URL}`);
  }

  addPayment(payment: Omit<Payment, 'id'>): Observable<any> {
    return this.http.post(`${this.BASE_URL}`, payment);
  }

  updatePayment(payment: Payment): Observable<any> {
    return this.http.patch(`${this.BASE_URL}/${payment.visit_id}`, payment);
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}



