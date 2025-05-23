import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Manager } from '../types/manager';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
    constructor(private http: HttpClient) {}

  private readonly BASE_URL = 'http://localhost:3000/api/managers';


  getManagers(): Observable<Manager[]> {
    return this.http.get<Manager[]>(`${this.BASE_URL}`);
  }

  addManager(manager: Omit<Manager, 'id'>): Observable<any> {
    return this.http.post(`${this.BASE_URL}`, manager);
  }

  updateManager(manager: Manager): Observable<any> {
    return this.http.put(`${this.BASE_URL}/${manager.id}`, manager);
  }

  deleteManager(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}



