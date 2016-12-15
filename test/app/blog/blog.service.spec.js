/* globals expect HttpMock */
require('reflect-metadata/Reflect.js');

var path = '../../../build/blog/',
    BlogService = require(path + 'blog.service.js').BlogService;

describe('BlogService', () => {
    var blogService;

    beforeEach(() => {
        blogService = new BlogService(HttpMock);
    });

    it('gets blog details from the api', done => {
        blogService.getDetails().subscribe(res => {
            expect(res.endpoint).to.equal('api/details');
            done();
        });
    });

    it('gets posts from the api', done => {
        blogService.getPosts().subscribe(res => {
            expect(res.endpoint).to.equal('api/posts');
            done();
        });
    });

    it('gets a specific post from the api', done => {
        blogService.getPost('test').subscribe(res => {
            expect(res.endpoint).to.equal('api/posts/test');
            done();
        });
    });

    it('gets authors from the api', done => {
        blogService.getAuthors().subscribe(res => {
            expect(res.endpoint).to.equal('api/authors');
            done();
        });
    });

    it('gets a specific author from the api', done => {
        blogService.getAuthor(1).subscribe(res => {
            expect(res.endpoint).to.equal('api/authors/1');
            done();
        });
    });

    it('gets posts by a specific author from the api', done => {
        blogService.getPostsByAuthor(1).subscribe(res => {
            expect(res.endpoint).to.equal('api/authors/1/posts');
            done();
        });
    });
});

