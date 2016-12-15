/* globals expect TitleMock BlogServiceMock */
require('reflect-metadata/Reflect.js');

var path = '../../../build/blog/',
    Blog = require(path + 'blog.component.js').Blog;

require('./blog.service.mock.js');

describe('Blog', () => {
    var blog;

    beforeEach(() => {
        var sanitizer = {
            bypassSecurityTrustStyle(text) { return text; }
        };

        blog = new Blog(new TitleMock(), BlogServiceMock, sanitizer);
    });

    it('sets the header style when constructed', () => {
        expect(blog.headerStyle).to
            .equal('background: linear-gradient(rgba(0, 0, 0, 0.2), ' +
            'rgba(0, 0, 0, 0.2))');
    });

    it('implements ngOnInit', done => {
        blog.postsPerPage = 2;
        blog.ngOnInit();

        BlogServiceMock.getDetails()
            .subscribe(response => {
                expect(blog.details.name).to.equal('test');
                done();
            });
    });

    it('increments the page in the nextPage function', () => {
        blog.paging.current = 1;
        blog.paging.total = 3;

        blog.nextPage();
        expect(blog.paging.current).to.equal(2);
    });

    it('decrements the page in the prevPage function', () => {
        blog.paging.current = 2;

        blog.prevPage();
        expect(blog.paging.current).to.equal(1);
    });

    it('has a method for the template to get author data', done => {
        expect(blog.getAuthor(1).id).to.equal(undefined);

        BlogServiceMock.getAuthors().subscribe(res => {
            blog.authors = res.data[0];

            expect(blog.getAuthor(1).username).to.equal('test');
            done();
        });
    });
});

