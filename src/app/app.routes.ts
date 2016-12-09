import { Routes, RouterModule } from '@angular/router';

import { Blog } from './blog/blog.component';
import {
    AuthGuard,
    Login,
    Dashboard,
    Editor
} from './admin/index';

const ROUTES: Routes = [
    {
        path: 'admin/dash',
        component: Dashboard,
        canActivate: [ AuthGuard ]
    },
    {
        path: 'admin/post/:slug',
        component: Editor,
        canActivate: [ AuthGuard ]
    },
    {
        path: 'admin/post',
        component: Editor,
        canActivate: [ AuthGuard ]
    },
    {
        path: 'admin',
        component: Login,
    },
    // {
    //     path: 'posts/:slug',
    //     component: Posts
    // },
    // {
    //     path: 'authors/:id',
    //     component: Authors
    // },
    {
        path: '',
        component: Blog
    }
];

export const ROUTE_COMPONENTS: Array<any> = [
    Blog,
    Login,
    Dashboard,
    Editor
];

export const APP_ROUTING = RouterModule.forRoot(ROUTES);

