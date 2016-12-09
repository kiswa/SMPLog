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
export class DashboardService {

    constructor(private http: Http){
    }

    getDetails() {
        return this.http.get('api/details')
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    updateDetails(details: Details) {
        return this.http.post('api/admin/details', details)
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    getPosts() {
        return this.http.get('api/admin/posts')
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    getAuthors() {
        return this.http.get('api/admin/authors')
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    updateAuthor(author: User) {
        return this.http.post('api/admin/authors/' + author.id, author)
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    addAuthor(author: any) {
        return this.http.post('api/admin/authors', author)
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    removeAuthor(id: number) {
        return this.http.delete('api/admin/authors/' + id)
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    removePost(id: number) {
        return this.http.delete('api/admin/posts/' + id)
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    publishPost(id: number) {
        return this.http.post('api/admin/posts/' + id + '/publish', {})
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    unpublishPost(id: number) {
        return this.http.post('api/admin/posts/' + id + '/unpublish', {})
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

