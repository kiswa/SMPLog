import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { EditorService } from './editor.service';
import { NotificationsService } from '../shared/index';
import {
    ApiResponse,
    Notification,
    Post
} from '../../shared/index';

// Hides useless TS compiler error
declare var hljs: any;

@Component({
    selector: 'smpl-editor',
    templateUrl: 'app/admin/editor/editor.component.html'
})
export class Editor implements OnInit {
    private isEdit: boolean = false;
    private post: Post = <Post>{};
    private convertedMarkdown: SafeHtml;

    constructor(private route: ActivatedRoute,
                private editService: EditorService,
                private sanitizer: DomSanitizer,
                private notes: NotificationsService) {
        this.post.id = 0;
        this.post.title = '';
        this.post.text = '';
        this.post.is_published = false;
    }

    ngOnInit() {
        let slug = this.route.snapshot.params['slug'];

        if (slug) {
            this.isEdit = true;

            this.editService.getPost(slug)
                .subscribe((res: ApiResponse) => {
                    let post = res.data[0];

                    this.post.id = post.id;
                    this.post.title = post.title;
                    this.post.text = post.text;
                    this.post.is_published = post.is_published === '1';

                    this.updateMarkdown();
                });
        }
    }

    publishPost() {
        if (this.post.title === '') {
            this.notes.add(new Notification('error',
                'Title is required to save the post.'));
            return;
        }

        this.editService.publishPost(this.post.id).
            subscribe((res: ApiResponse) => {
                this.addNotes(res);

                this.post = res.data[0];
                this.post.is_published = this.post.is_published === '1';
            });
    }

    unpublishPost() {
        this.editService.unpublishPost(this.post.id).
            subscribe((res: ApiResponse) => {
                this.addNotes(res);

                this.post = res.data[0];
                this.post.is_published = this.post.is_published === '1';
            });
    }

    savePost() {
        if (this.post.title === '') {
            this.notes.add(new Notification('error',
                'Title is required to save the post.'));
            return;
        }

        if (this.post.id !== 0) {
            this.editService.updatePost(this.post).
                subscribe((res: ApiResponse) => {
                    this.addNotes(res);

                    this.post = res.data[0];
                    this.post.is_published = this.post.is_published === '1';
                });

            return;
        }

        this.editService.addPost(this.post).
            subscribe((res: ApiResponse) => {
                this.addNotes(res);

                this.post = res.data[0];
                this.post.is_published = this.post.is_published === '1';

                this.isEdit = true;
            });
    }

    private addNotes(res: ApiResponse) {
        res.alerts.forEach(msg => {
            this.notes.add(msg);
        });
    }

    private updateMarkdown() {
        let header = '<h1>' + this.post.title + '</h1>';
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
            bypassSecurityTrustHtml(header + marked(this.post.text));
    }

}

