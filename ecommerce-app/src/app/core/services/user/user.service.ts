import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User, userSchema } from '../../types/User';
import { environment } from '../../../../environments/environment';
import { z } from 'zod';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.BACK_URL}/users`;

  constructor(private httpClient: HttpClient) {}

  getUserById(userId: string): Observable<User> {
    return this.httpClient.get(`${this.baseUrl}/${userId}`).pipe(
      map((data: any) => {
        const response = userSchema.safeParse(data.user);
        if (!response.success) {
          console.log(response.error);
          throw new Error(`${response.error}`);
        }
        return response.data;
      })
    );
  }
  getUsers(): Observable<User[]> {
    return this.httpClient.get<any>(this.baseUrl).pipe(
      map((data: any) => {
        const raw = Array.isArray(data) ? data : data.users;

        const response = z.array(userSchema).safeParse(raw);
        if (!response.success) {
          console.log(response.error);
          throw new Error(`${response.error}`);
        }
        return response.data;
      })
    );
  }
  toggleUserStatus(userId: string): Observable<User> {
    return this.httpClient
      .patch<any>(`${this.baseUrl}/${userId}/toggle-status`, {})
      .pipe(
        map((data: any) => {
          const response = userSchema.safeParse(data.user);
          if (!response.success) throw new Error(`${response.error}`);
          return response.data;
        })
      );
  }

  softDeleteUser(userId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${userId}`);
  }

  getMyProfile(): Observable<User> {
  return this.httpClient.get<any>(`${this.baseUrl}/profile`).pipe(
    map((data: any) => {
      const response = userSchema.safeParse(data.user);
      if (!response.success) {
        console.log(response.error);
        throw new Error(`${response.error}`);
      }
      return response.data;
    })
  );
}

}
