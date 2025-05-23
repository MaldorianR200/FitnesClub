import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Client } from '../types/client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
    constructor(private http: HttpClient) {}

  private readonly BASE_URL = 'http://localhost:3000/api/clients';


  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.BASE_URL}`);
  }

  addClient(client: Omit<Client, 'id'>): Observable<any> {
    return this.http.post(`${this.BASE_URL}`, client);
  }

  updateClient(client: Client): Observable<any> {
    return this.http.patch(`${this.BASE_URL}/${client.id}`, client);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}



