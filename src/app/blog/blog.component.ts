import { Component } from '@angular/core';

@Component({
    selector: 'smpl-blog',
    templateUrl: 'app/blog/blog.component.html'
})
export class Blog {
    private showHomeLink: boolean = true;
    private showTitle: boolean = true;
    private currentYear = new Date().getFullYear();

    private details = {
        title: 'SMPLog'
    };

    private paging = {
        current: 1,
        total: 1,
        showNewer: true,
        showOlder: true,
        visiblePosts: Array<any>()
    };

}

