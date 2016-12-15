/* globals expect TitleMock BlogServiceMock */

var path = "../../../../build/blog/posts/",
    Posts = require(path + 'posts.component.js').Posts;

require('../blog.service.mock.js');

describe('Posts', () => {
    var posts,
        route = {
            snapshot: {
                params: {
                    slug: 'test'
                }
            }
        },
        sanitizer = {
            bypassSecurityTrustHtml(text) { return text; }
        };

    beforeEach(() => {
        posts = new Posts(new TitleMock(), route, sanitizer, BlogServiceMock);
    });

    it('gets blog details when constructed', done => {
        expect(posts.details.name).to.equal('test');

        BlogServiceMock.details = undefined;
        posts = new Posts(new TitleMock(), route, sanitizer, BlogServiceMock);

        BlogServiceMock.getDetails().subscribe(() => {
            expect(posts.details.name).to.equal('test');
            done();
        });
    });

    it('implements ngOnInit', done => {
        posts.ngOnInit();

        BlogServiceMock.getDetails().subscribe(() => {
            expect(posts.post.id).to.equal(1);
            expect(posts.isLoading).to.equal(false);
            done();
        });
    });

    it('has a getLink function for the template', () => {
        expect(posts.getLink()).to.equal('test');
    });
});

