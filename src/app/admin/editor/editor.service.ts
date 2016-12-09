import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiResponse } from '../shared/index';

@Injectable()
export class EditorService {

    constructor(private http: Http){
    }

    getPost(slug: string) {
        return this.http.get('api/posts/' + slug)
            .map((res) => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

}

