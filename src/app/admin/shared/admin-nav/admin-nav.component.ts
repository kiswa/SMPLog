import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AuthService, } from '../index';
// Can't import this from the barrel for some reason
import { NotificationsService } from '../notifications/notifications.service';
import {
    ApiResponse,
    Notification
} from '../../../shared/index';

@Component({
    selector: 'smpl-nav',
    templateUrl: 'app/admin/shared/admin-nav/admin-nav.component.html'
})
export class AdminNav {
    @Input() page: string = 'dashboard';

    constructor(private authService: AuthService,
                private router: Router,
                private notes: NotificationsService,
                private title: Title) {
        title.setTitle('SMPLog - Admin');
    }

    logout(): void {
        this.authService.logout()
            .subscribe((res: ApiResponse) => {
                res.alerts.forEach((msg: Notification) => {
                    this.notes.add(msg);
                });
            });
    }

    navigateTo(page: string): void {
        this.router.navigate(['/admin/' + page]);
    }
}

