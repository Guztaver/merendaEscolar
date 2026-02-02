import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class UsersResourceService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/users';

    findAll(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    findOne(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    create(user: Partial<User>): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    update(id: string, user: Partial<User>): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/${id}`, user);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
