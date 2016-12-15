import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { BlogService } from '../blog.service';
import {
    ApiResponse,
    Details,
    Post,
    User
} from '../../shared/index';

// Hides useless TS compiler error
declare var hljs: any;

@Component({
    selector: 'smpl-posts',
    templateUrl: 'app/blog/posts/posts.component.html'
})
export class Posts implements OnInit {
    private isLoading: boolean = true;
    private encodedUrl: string = '';
    private currentYear: number = new Date().getFullYear();
    private convertedMarkdown: SafeHtml;

    private details: Details = <Details>{};
    private post: Post = <Post>{};
    private author: User = <User>{};

    constructor(private title: Title,
                private route: ActivatedRoute,
                private sanitizer: DomSanitizer,
                private blogService: BlogService) {
        if (blogService.details) {
            this.details = blogService.details;
            title.setTitle(blogService.details.name);
        } else {
            blogService.getDetails()
                .subscribe((res: ApiResponse) => {
                    this.details = res.data[0];
                    this.blogService.details = res.data[0];

                    this.title.setTitle(this.details.name);
                });
        }
    }

    ngOnInit() {
        let slug = this.route.snapshot.params['slug'];

        this.blogService.getPost(slug)
            .subscribe((res: ApiResponse) => {
                this.post = res.data[0];
                this.convertMarkdown();

                this.blogService.getAuthor(this.post.user_id)
                    .subscribe((res: ApiResponse) => {
                        this.isLoading = false;
                        this.author = res.data[0];
                    });
            });
    }

    getLink(): string {
        return encodeURI(window.location.href);
    }

    private convertMarkdown() {
        let myRenderer = new marked.Renderer();

        myRenderer.code = function(code: string, lang: string) {
            if (lang && hljs.listLanguages().indexOf(lang) >= 0) {
                try {
                    code = hljs.highlight(lang, code).value;
                } catch (e) { }
            }

            return '<pre class="hljs' +
                (lang ? ' ' + this.options.langPrefix + lang + '"' : '"') +
                '><code>' + code + '\n</code></pre>\n';
        };

        marked.setOptions({
            renderer: myRenderer
        });

        this.convertedMarkdown = this.sanitizer.
            bypassSecurityTrustHtml(marked(this.post.text));
    }
}

