import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
    ApiResponse,
    Post
} from '../../shared/index';

@Injectable()
export class EditorService {

    constructor(private http: Http){
    }

    getPost(slug: string) {
        return this.http.get('api/posts/' + slug)
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

    addPost(post: Post) {
        return this.http.post('api/admin/posts', post)
            .map(this.getApiResponse)
            .catch(this.getErrorResponse);
    }

    updatePost(post: Post) {
        return this.http.post('api/admin/posts/' + post.id, post)
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

