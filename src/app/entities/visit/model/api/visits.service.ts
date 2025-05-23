import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Visit } from '../types/visit';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
    constructor(private http: HttpClient) {}

  private readonly BASE_URL = 'http://localhost:3000/api/visits';


  getVisits(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.BASE_URL}`);
  }

  addVisit(visit: Omit<Visit, 'id'>): Observable<any> {
    return this.http.post(`${this.BASE_URL}`, visit);
  }

  updateVisit(visit: Visit): Observable<any> {
    return this.http.put(`${this.BASE_URL}/${visit.id}`, visit);
  }

  deleteVisit(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}



