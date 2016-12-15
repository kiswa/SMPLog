import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
    ApiResponse,
    Details,
    User
} from '../shared/index';

@Injectable()
export class BlogService {
    public details: Details;

    constructor(private http: Http){
    }

    getDetails() {
        return this.http.get('api/details')
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    getPosts() {
        return this.http.get('api/posts')
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    getPost(slug: string) {
        return this.http.get('api/posts/' + slug)
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    getAuthors() {
        return this.http.get('api/authors')
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    getAuthor(id: number) {
        return this.http.get('api/authors/' + id)
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    getPostsByAuthor(id: number) {
        return this.http.get('api/authors/' + id + '/posts')
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    private getApiResponse(res: Response): ApiResponse {
        let response: ApiResponse = res.json();
        return response;
    }

    private getErrorResponse(res: Response, caught: any): Observable<ApiResponse> {
        let response: ApiResponse = res.json();
        return Observable.of(response);
    }
}

