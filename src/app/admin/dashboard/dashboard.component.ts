import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DashboardService } from './dashboard.service';
import {
    AuthService,
    NotificationsService
} from '../shared/index';
import {
    ApiResponse,
    Notification,
    User,
    Post,
    Details
} from '../../shared/index';

@Component({
    selector: 'smpl-dashboard',
    templateUrl: 'app/admin/dashboard/dashboard.component.html'
})
export class Dashboard implements OnInit {
    private tab: string = 'posts';
    private sort: string = 'desc';
    private show: string = 'all';
    private loading: boolean = true;

    private posts: Array<Post> = [];
    private fullPosts: Array<Post> = [];
    private authors: Array<User> = [];

    private details: Details;
    private activeUser: User;

    private changePass = {
        current: '',
        update: '',
        verify: ''
    };

    private newUser = {
        username: '',
        password: '',
        verify: ''
    };

    constructor(private dashService: DashboardService,
                private auth: AuthService,
                private notes: NotificationsService,
                private router: Router) {
        auth.userChanged
            .subscribe(activeUser => {
                this.activeUser = activeUser;
            });
    }

    ngOnInit() {
        this.dashService.getPosts()
            .subscribe(response => {
                this.posts = response.data[0];
                this.showNotes(response);

                this.prepPosts();

                this.dashService.getDetails()
                    .subscribe(response => {
                        this.details = response.data[0];
                        this.showNotes(response);

                        this.dashService.getAuthors()
                            .subscribe(response => {
                                this.loading = false;
                                this.authors = response.data[0];
                                this.showNotes(response);
                            });
                    });
            });
    }

    changeTab(newTab: string) {
        this.tab = newTab;
    }

    updateDetails() {
        this.dashService.updateDetails(this.details)
            .subscribe((res: ApiResponse) => {
                this.showNotes(res);
                this.details = res.data[0];
            });
    }

    updateAuthor() {
        this.dashService.updateAuthor(this.activeUser)
        .subscribe((res: ApiResponse) => {
            this.showNotes(res);
            this.activeUser = res.data[0];
            this.updateUserInList(this.activeUser);
        })
    }

    addAuthor() {
        if (this.newUser.username === '') {
            this.notes.add(new Notification('error',
                'Username is required.'));
            return;
        }

        if (this.newUser.password === '' || this.newUser.verify === '') {
            this.notes.add(new Notification('error',
                'Password and Verify Password are required.'));
            return;
        }

        if (this.newUser.password !== this.newUser.verify) {
            this.notes.add(new Notification('error',
                'The new password entries do not match.'));
            return;
        }

        let newAuthor = {
            username: this.newUser.username,
            password: this.newUser.password
        };

        this.dashService.addAuthor(newAuthor)
            .subscribe((res: ApiResponse) => {
                this.showNotes(res);
                this.authors = res.data[0];
            });
    }

    removeAuthor(id: number) {
        this.dashService.removeAuthor(id)
            .subscribe((res: ApiResponse) => {
                this.showNotes(res);
                this.authors = res.data[0];
            });
    }

    restoreAuthor(id: number) {
        let user = this.authors.find(author => {
            return author.id === id;
        });

        if (!user) { return; }

        user.is_active = true;

        this.dashService.updateAuthor(user)
            .subscribe((res: ApiResponse) => {
                this.showNotes(res);

                let index = this.authors.findIndex(user => {
                    return user.id === id;
                });

                this.authors[index] = res.data[0];
            });
    }

    changePassword() {
        if (this.changePass.update === '' || this.changePass.verify === '') {
            this.notes.add(new Notification('error',
                'New Password and Verify Password are required.'));
            return;
        }

        if (this.changePass.update !== this.changePass.verify) {
            this.notes.add(new Notification('error',
                'The new password entries do not match.'));
            return;
        }

        let props = {
            password: '',
            old_password: ''
        };
        let tmp = Object.assign(props, this.activeUser);

        tmp.password = this.changePass.update;
        tmp.old_password = this.changePass.current;

        this.dashService.updateAuthor(tmp)
            .subscribe((res: ApiResponse) => {
                this.showNotes(res);

                this.changePass.current = '';
                this.changePass.update = '';
                this.changePass.verify = '';
            });
    }

    removePost(id: number) {
        if (!confirm("This cannot be undone.\nAre you sure?")) {
            return;
        }

        this.dashService.removePost(id)
            .subscribe((res: ApiResponse) => {
                this.showNotes(res);
                this.posts = res.data[0];
                this.prepPosts();
            })
    }

    toggleIsPublished(id: number) {
        let post = this.fullPosts.find(post => {
            return post.id === id;
        });

        function setupPost(that: any) {
            let text = post.text;

            post.short_text = marked(text.substring(0, text.indexOf('\n')));
            post.is_published = post.is_published === '1';

            let index = that.fullPosts.findIndex((find: any) => {
                return post.id === find.id;
            });

            that.fullPosts[index] = post;
            that.posts = that.fullPosts.slice();
            that.filterPosts();
        }

        if (post.is_published) {
            this.dashService.unpublishPost(post.id)
                .subscribe((res: ApiResponse) => {
                    this.showNotes(res);
                    post = res.data[0];
                    setupPost(this);
                });
            return;
        }

        this.dashService.publishPost(post.id)
            .subscribe((res: ApiResponse) => {
                this.showNotes(res);
                post = res.data[0];
                setupPost(this);
            });
    }

    editPost(slug: string) {
        this.router.navigate([ '/admin/post/' + slug ]);
    }

    private updateUserInList(author: User) {
        let index = this.authors.findIndex((user: User) => {
            return user.id === author.id;
        });

        this.authors[index] = author;
    }

    private showNotes(res: ApiResponse) {
        res.alerts.forEach((msg: Notification) => {
            this.notes.add(msg);
        });
    }

    private prepPosts() {
        this.fullPosts = this.posts.slice();

        this.posts.forEach(post => {
            let text = post.text;
            post.short_text = marked(text.substring(0, text.indexOf('\n')));
            post.is_published = post.is_published === '1';
        });

        this.sortPosts();
    }

    private sortPosts() {
        if (this.sort === 'desc') {
            // Sort from highest id to lowest
            this.posts.sort((a, b) => {
                return +a.id < +b.id
                    ? 1
                    : +a.id > +b.id
                        ? -1
                        : 0;
            });

            return;
        }

        // Sort from lowest id to highest
        this.posts.sort((a, b) => {
            return +a.id < +b.id
                ? -1
                : +a.id > +b.id
                    ? 1
                    : 0;
        });
    }

    private filterPosts() {
        if (this.show === 'all') {
            this.posts = this.fullPosts.slice();
            this.sortPosts();

            return;
        }

        this.posts = this.fullPosts.filter(post => {
            return post.is_published === (this.show === 'pub') ? true : false;
        });

        this.sortPosts();
    }

    private titleSearch(title: string) {
        if (!title || title === '') {
            this.posts = this.fullPosts.slice();
            this.sortPosts();

            return;
        }

        this.posts = this.fullPosts.filter(post => {
            let lower = post.title.toLowerCase();

            return lower.indexOf(title.toLowerCase()) !== -1;
        });

        this.sortPosts();
    }
}

