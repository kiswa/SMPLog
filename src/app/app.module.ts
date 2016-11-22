import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { APP_ROUTING, ROUTE_COMPONENTS } from './app.routes';
import { AppComponent } from './app.component';
import { API_HTTP_PROVIDERS } from './app.api-http';

// TODO: Insert app imports

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        APP_ROUTING
    ],
    providers: [
        Title,
        API_HTTP_PROVIDERS
    ],
    declarations: [
        AppComponent,
        ...ROUTE_COMPONENTS
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }

