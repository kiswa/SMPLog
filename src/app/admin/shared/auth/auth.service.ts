import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiResponse, User } from '../index';

@Injectable()
export class AuthService {
    private activeUser = new BehaviorSubject<User>(null);

    public userChanged = this.activeUser.asObservable();

    constructor(private http: Http) {
    }

    updateUser(user: User) {
        this.activeUser.next(user);
    }

    authenticate(): Observable<boolean> {
        return this.http.post('api/admin/authenticate', null)
            .map(res => {
                let response: ApiResponse = res.json();
                this.updateUser(response.data[0]);

                return true;
            })
            .catch((res, caught) => {
                return Observable.of(false);
            });
    }

    login(username: string, password: string,
            remember: boolean): Observable<ApiResponse> {
        let json = JSON.stringify({
            username,
            password,
            remember
        });

        return this.http.post('api/admin/login', json)
            .map(res => {
                let response: ApiResponse = res.json();

                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();

                return Observable.of(response);
            });
    }

    logout(): Observable<ApiResponse> {
        return this.http.post('api/admin/logout', null)
            .map(res => {
                let response: ApiResponse = res.json();

                return response;
            });
    }
}

