import { Component } from '@angular/core';

import { Notification } from '../../../shared/index';
import { NotificationsService } from './notifications.service';

@Component({
    selector: 'smpl-notifications',
    templateUrl: 'app/admin/shared/notifications/notifications.component.html'
})
export class Notifications {
    private notes: Array<Notification>;

    constructor(private notifications: NotificationsService) {
        this.notes = [];

        notifications.noteAdded
            .subscribe((note: Notification) => {
                this.notes.push(note);
                setTimeout(() => { this.hide.bind(this)(note) }, 3000);
            });
    }

    private hide(note: Notification): void {
        let index = this.notes.indexOf(note);

        if (index >= 0) {
            note.type += " clicked";

            setTimeout(() => {
                this.notes.splice(index, 1);
            }, 500); // 500ms is the fade out transition time
        }
    }
}

