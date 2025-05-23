import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Service } from '../types/service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
    constructor(private http: HttpClient) {}

  private readonly BASE_URL = 'http://localhost:3000/api/services';


  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.BASE_URL}`);
  }

  addService(manager: Omit<Service, 'id'>): Observable<any> {
    return this.http.post(`${this.BASE_URL}`, manager);
  }

  updateService(manager: Service): Observable<any> {
    return this.http.put(`${this.BASE_URL}/${manager.id}`, manager);
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}



