import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DuesHistoryResponse } from '../interfaces/interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = 'https://hoamsapi.onrender.com/api/homeowner';

  constructor(private http: HttpClient) { }
  
  getMonthlyDuesHistory(accountNumber: string): Observable<DuesHistoryResponse> {
    return this.http.post<DuesHistoryResponse>(`${this.baseUrl}/dues`, { accountNumber });
  }

  getGarbageCollectionStatus(accountNumber: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/garbage-collection`, { accountNumber });
  }

}