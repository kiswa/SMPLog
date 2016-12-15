/* globals expect NotificationsServiceMock EditorServiceMock */
require('reflect-metadata/Reflect.js');

var path = '../../../../build/admin/editor/',
    Editor = require(path + 'editor.component.js').Editor;

require('./editor.service.mock.js');

describe('Editor', () => {
    var editor;

    beforeEach(() => {
        var route = {
            snapshot: {
                params: {
                    slug: 'test'
                }
            }
        };

        var sanitizer = {
            bypassSecurityTrustHtml(text) { return text; }
        };

        editor = new Editor(route, EditorServiceMock,
            sanitizer, new NotificationsServiceMock());
    });

    it('loads a post for editing in ngOnInit', () => {
        editor.ngOnInit();

        expect(editor.post.id).to.equal(1);
        expect(editor.post.title).to.equal('test');
        expect(editor.post.text).to.equal('testing');
        expect(editor.post.is_published).to.equal(true);
    });

    it('validates the post title before publishing', done => {
        editor.notes.noteAdded.subscribe(note => {
            expect(note.type).to.equal('error');
            done();
        });

        editor.publishPost();
    });

    it('can publish a post', done => {
        editor.post.title = 'test';

        editor.publishPost();

        EditorServiceMock.publishPost().subscribe(() => {
            expect(editor.post.is_published).to.equal(true);
            done();
        });
    });

    it('can unpublish a post', done => {
        editor.unpublishPost();

        EditorServiceMock.unpublishPost().subscribe(() => {
            expect(editor.post.is_published).to.equal(false);
            done();
        });
    });

    it('validates the post title before saving/updating', done => {
        editor.post.title = '';

        editor.notes.noteAdded.subscribe(note => {
            expect(note.type).to.equal('error');
            done();
        });

        editor.savePost();
    });

    it('can add a new post', done => {
        editor.post.title = 'adding a post';

        editor.savePost();

        EditorServiceMock.addPost().subscribe(() => {
            expect(editor.post.title).to.equal('added');
            done();
        });
    });

    it('can update an existing post', done => {
        editor.post.title = 'updating a post';
        editor.post.id = 1;

        editor.savePost();

        EditorServiceMock.updatePost().subscribe(() => {
            expect(editor.post.title).to.equal('updated');
            done();
        });
    });
});

