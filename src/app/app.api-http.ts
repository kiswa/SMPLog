import { Provider } from '@angular/core';
import {
    Http,
    Request,
    RequestOptionsArgs,
    Response,
    XHRBackend,
    RequestOptions,
    ConnectionBackend,
    Headers
} from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiResponse } from './shared/index';

export const API_HTTP_PROVIDERS = [
    {
        provide: Http,
        useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions,
            router: Router) =>
                new ApiHttp(xhrBackend, requestOptions, router),
        deps: [XHRBackend, RequestOptions, Router]
    }
];

export class ApiHttp extends Http {
    private JWT_KEY = 'smplog.jwt';

    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions,
            private router: Router) {
        super(backend, defaultOptions);
    }

    request(url: string | Request,
            options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.request(url,
            this.getRequestOptionArgs(options)));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.get(url,
            this.getRequestOptionArgs(options)));
    }

    post(url: string, body: string,
            options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.post(url, body,
            this.getRequestOptionArgs(options, body)));
    }

    put(url: string, body: string,
            options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.put(url, body,
            this.getRequestOptionArgs(options, body)));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.delete(url,
            this.getRequestOptionArgs(options)));
    }

    getRequestOptionArgs(options?: RequestOptionsArgs,
            body?: string): RequestOptionsArgs {
        if (!options) {
            options = new RequestOptions();
        }

        if (!options.headers) {
            options.headers = new Headers();
        }

        options.headers.append('Content-Type', 'application/json');

        let jwt = localStorage.getItem(this.JWT_KEY);
        if (jwt) {
            options.headers.append('Authorization', jwt);
        }

        return options;
    }

    intercept(observable: Observable<Response>): Observable<Response> {
        return observable
            .map((res: Response) => {
                if (res.url.indexOf('login') !== -1) {
                    let response: ApiResponse = res.json();
                    localStorage.setItem(this.JWT_KEY, response.data[0].active_token);
                }

                return res;
            })
            .catch((err, source) => {
                // 401 for invalid token, 400 for no token, and convert
                // url to string in case it is null.
                if ((err.status === 401 || err.status === 400) &&
                        (err.url + '').indexOf('login') === -1) {
                    this.router.navigate(['/admin']);
                    localStorage.removeItem(this.JWT_KEY);
                }

                return Observable.throw(err);
            });
    }
}

