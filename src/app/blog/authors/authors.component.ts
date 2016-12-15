import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { BlogService } from '../blog.service';
import {
    ApiResponse,
    Details,
    Post,
    User
} from '../../shared/index';

@Component({
    selector: 'smpl-authors',
    templateUrl: 'app/blog/authors/authors.component.html'
})
export class Authors implements OnInit {
    private details: Details = <Details>{};
    private author: User = <User>{};
    private posts: Array<Post> = [];

    private headerStyle: SafeStyle;

    constructor(private title: Title,
                private route: ActivatedRoute,
                private sanitizer: DomSanitizer,
                private blogService: BlogService) {
        this.headerStyle = sanitizer.bypassSecurityTrustStyle(
            'background: linear-gradient(rgba(0, 0, 0, 0.2), ' +
            'rgba(0, 0, 0, 0.2))');

        if (blogService.details) {
            this.details = blogService.details;
            title.setTitle(blogService.details.name);
        }
    }

    ngOnInit() {
        let id = this.route.snapshot.params['id'];

        this.blogService.getAuthor(id)
            .subscribe((res: ApiResponse) => {
                this.author = res.data[0];

                this.blogService.getPostsByAuthor(id)
                    .subscribe((res: ApiResponse) => {
                        this.posts = res.data[0];
                        this.prepPosts();
                    });
            });

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
            });
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
    }
}

