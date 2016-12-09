import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { EditorService } from './editor.service';
import {
    AuthService,
    NotificationsService,
    ApiResponse,
    Notification,
    Post
} from '../shared/index';

@Component({
    selector: 'smpl-editor',
    templateUrl: 'app/admin/editor/editor.component.html'
})
export class Editor implements OnInit {
    private isEdit: boolean = false;
    private isPublished: boolean = false;

    private title: string = '';
    private text: string = '';
    private convertedMarkdown: SafeHtml;

    constructor(private route: ActivatedRoute,
                private editService: EditorService,
                private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        let slug = this.route.snapshot.params['slug'];

        if (slug) {
            this.isEdit = true;

            this.editService.getPost(slug)
                .subscribe((res: ApiResponse) => {
                    let post = res.data[0];

                    this.title = post.title;
                    this.text = post.text;
                    this.isPublished = post.is_published === '1';

                    this.updateMarkdown();
                });
        }
    }

    updateMarkdown() {
        let header = '<h1>' + this.title + '</h1>';
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

        this.convertedMarkdown =
            this.sanitizer.bypassSecurityTrustHtml(header + marked(this.text));
    }

}

