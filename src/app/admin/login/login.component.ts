import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import {
    AuthService,
    ApiResponse,
    Notification,
    NotificationsService
} from '../shared/index';

@Component({
    selector: 'smpl-login',
    templateUrl: 'app/admin/login/login.component.html'
})
export class Login {
    private username: string = '';
    private password: string = '';
    private remember: boolean = false;
    private isSubmitted: boolean = false;

    constructor(private authService: AuthService,
            private router: Router,
            private notes: NotificationsService,
            private title: Title) {
    }

    ngOnInit(): void {
        this.title.setTitle('SMPLog - Admin');

        this.authService.authenticate()
            .subscribe(isAuth => {
                if (isAuth) {
                    this.router.navigate(['/admin/dash']);
                }
            });
    }

    private login(): void {
        if (this.username === '' || this.password === '') {
            this.notes.add(new Notification('error',
                'Username and password are required.'));
            return;
        }

        this.isSubmitted = true;

        this.authService.login(this.username, this.password, this.remember)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach((msg: Notification) => {
                    this.notes.add(msg);
                });

                if (response.status === 'success') {
                    this.router.navigate(['/admin/dash']);
                }

                this.isSubmitted = false;
            });
    }
}

