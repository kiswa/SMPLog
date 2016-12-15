import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { APP_ROUTING, ROUTE_COMPONENTS } from './app.routes';
import { AppComponent } from './app.component';
import { API_HTTP_PROVIDERS } from './app.api-http';

import {
    AuthGuard,
    AuthService,
    Constants,
    Notifications,
    NotificationsService,
    AdminNav,
    DashboardService,
    EditorService
} from './admin/index';
import { BlogService } from './blog/blog.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        APP_ROUTING
    ],
    providers: [
        Title,
        API_HTTP_PROVIDERS,
        AuthGuard,
        AuthService,
        Constants,
        NotificationsService,
        DashboardService,
        EditorService,
        BlogService
    ],
    declarations: [
        AppComponent,
        Notifications,
        AdminNav,
        ...ROUTE_COMPONENTS
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }

