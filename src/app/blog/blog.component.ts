import { Component, OnInit } from '@angular/core';
import { Title, DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { BlogService } from './blog.service';
import {
    ApiResponse,
    Post,
    Details,
    User
} from '../shared/index';

@Component({
    selector: 'smpl-blog',
    templateUrl: 'app/blog/blog.component.html'
})
export class Blog implements OnInit {
    private postsPerPage: number = 5;
    private isLoading: boolean = true;
    private currentYear: number = new Date().getFullYear();
    private headerStyle: SafeStyle;

    private details: Details;
    private posts: Array<Post>;
    private authors: Array<User>;

    private paging = {
        current: 1,
        total: 1,
        showNewer: false,
        showOlder: false,
        visiblePosts: Array<any>()
    };

    constructor(private title: Title, private blogService: BlogService,
                private sanitizer: DomSanitizer) {
        this.posts = [];
        this.authors = [];
        this.details = <Details>{};

        this.headerStyle = sanitizer.bypassSecurityTrustStyle(
            'background: linear-gradient(rgba(0, 0, 0, 0.2), ' +
            'rgba(0, 0, 0, 0.2))');
    }

    ngOnInit() {
        this.blogService.getDetails()
            .subscribe((res: ApiResponse) => {
                this.details = res.data[0];
                this.blogService.details = res.data[0];

                this.title.setTitle(this.details.name);

                if (this.details.image.length) {
                    this.headerStyle = this.sanitizer.bypassSecurityTrustStyle(
                        'background: linear-gradient(rgba(0, 0, 0, 0.2), ' +
                        'rgba(0, 0, 0, 0.2)), ' +
                        'url(' + this.details.image + ')');
                }

                this.blogService.getAuthors()
                    .subscribe((res: ApiResponse) => {
                        this.authors = res.data[0];

                        this.blogService.getPosts()
                            .subscribe((res: ApiResponse) => {
                                this.posts = res.data[0];
                                this.isLoading = false;

                                this.prepPosts();
                            });
                    });
            });
    }

    nextPage() {
        if (this.paging.current < this.paging.total) {
            this.paging.current += 1;
        }

        this.updateVisiblePosts();
        this.setPrevNextLinks();
        window.scrollTo(0,0);
    }

    prevPage() {
        if (this.paging.current > 1) {
            this.paging.current -= 1;
        }

        this.updateVisiblePosts();
        this.setPrevNextLinks();
        window.scrollTo(0,0);
    }

    private prepPosts() {
        this.posts.forEach(post => {
            let text = post.text;
            post.short_text = marked(text.substring(0, text.indexOf('\n')));
        });

        this.posts.sort((a, b) => {
                return +a.id < +b.id
                    ? 1
                    : +a.id > +b.id
                        ? -1
                        : 0;
            });

        this.initPaging();
    }

    private initPaging() {
        this.paging.total = Math.ceil(this.posts.length / this.postsPerPage);

        if (this.paging.total > 1) {
            this.paging.showOlder = true;
        }

        this.updateVisiblePosts();
    }

    private setPrevNextLinks() {
        this.paging.showOlder = (this.paging.current < this.paging.total);
        this.paging.showNewer = (this.paging.current > 1);
    }

    private updateVisiblePosts() {
        let start = (this.paging.current - 1) * this.postsPerPage,
            end = start + this.postsPerPage;

        if (this.posts) {
            this.paging.visiblePosts = this.posts.slice(start, end);
        }
    }

    private getAuthor(id: number) {
        var match: User = <User>{};

        this.authors.forEach(author => {
            if (author.id === id) {
                match = author;
                return;
            }
        });

        if (match.id) {
            return match;
        }

        return <User>{};
    }

}

