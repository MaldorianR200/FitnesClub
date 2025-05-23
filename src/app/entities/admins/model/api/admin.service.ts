import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Admin } from '../types/admin';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
    constructor(private http: HttpClient) {}

  private readonly BASE_URL = 'http://localhost:3000/api/admins';


  getAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.BASE_URL}`);
  }

  addAdmin(admin: Omit<Admin, 'id'>): Observable<any> {
    return this.http.post(`${this.BASE_URL}`, admin);
  }

  updateAdmin(admin: Admin): Observable<any> {
    return this.http.put(`${this.BASE_URL}/${admin.id}`, admin);
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}




