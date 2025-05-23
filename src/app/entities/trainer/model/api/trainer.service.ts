import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Trainer } from '../types/trainer';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
    constructor(private http: HttpClient) {}

  private readonly BASE_URL = 'http://localhost:3000/api/trainers';


  getTrainers(): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(`${this.BASE_URL}`);
  }

  addTrainer(trainer: Omit<Trainer, 'id'>): Observable<any> {
    return this.http.post(`${this.BASE_URL}`, trainer);
  }

  updateTrainer(trainer: Trainer): Observable<any> {
    return this.http.put(`${this.BASE_URL}/${trainer.id}`, trainer);
  }

  deleteTrainer(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
}



