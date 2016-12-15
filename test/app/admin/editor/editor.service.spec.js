/* globals expect HttpMock */
require('reflect-metadata/Reflect.js');

var path = '../../../../build/admin/editor/',
    EditorService = require(path + 'editor.service.js').EditorService;

describe('EditorService', () => {
    var editService;

    beforeEach(() => {
        editService = new EditorService(HttpMock);
    });

    it('gets a post from the api', done=> {
        editService.getPost('test-post').subscribe(res => {
            expect(res.endpoint).to.equal('api/posts/test-post');
            done();
        });
    });

    it('publishes a post with the api', done => {
        editService.publishPost(1).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/posts/1/publish');
            done();
        });
    });

    it('unpublishes a post with the api', done => {
        editService.unpublishPost(1).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/posts/1/unpublish');
            done();
        });
    });

    it('adds a post with the api', done => {
        editService.addPost().subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/posts');
            done();
        });
    });

    it('updates a post with the api', done => {
        editService.updatePost({ id: 1 }).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/posts/1');
            done();
        });
    });
});

