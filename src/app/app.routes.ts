import { Routes, RouterModule } from '@angular/router';

const ROUTES: Array<any> = []; /*Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'posts/:slug',
        component: Posts
    },
    {
        path: 'authors/:id',
        component: Authors
    },
    {
        path: 'admin',
        component: Login
    },
    {
        path: 'admin/dash',
        component: Dashboard,
        canActivate: [ AuthGuard ]
    },
    {
        path: 'admin/post',
        component: Editor,
        canActivate: [ AuthGuard ]
    },
    {
        path: 'admin/post/:slug',
        component: Editor,
        canActivate: [ AuthGuard ]
    }
];*/

export const ROUTE_COMPONENTS: Array<any> = [
    /*Home,
    Posts,
    Authors,
    Login,
    Dashboard,
    Editor*/
];

export const APP_ROUTING = RouterModule.forRoot(ROUTES);

