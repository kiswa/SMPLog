/* globals expect HttpMock ResponseMock */
require('reflect-metadata/Reflect.js');

var path = '../../../../build/admin/dashboard/',
    DashboardService = require(path + 'dashboard.service.js').DashboardService;

describe('DashboardService', () => {
    var dashService;

    beforeEach(() => {
        dashService = new DashboardService(HttpMock);
    });

    it('gets blog details from the api', done => {
        dashService.getDetails().subscribe(res => {
            expect(res.endpoint).to.equal('api/details');
            done();
        });
    });

    it('updates blog details through the admin api', done => {
        dashService.updateDetails(null).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/details');
            done();
        });
    });

    it('gets posts through the admin api', done => {
        dashService.getPosts().subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/posts');
            done();
        });
    });

    it('gets authors through the admin api', done => {
        dashService.getAuthors().subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/authors');
            done();
        });
    });

    it('updates an author through the admin api', done => {
        dashService.updateAuthor({ id: 1 }).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/authors/1');
            done();
        });
    });

    it('adds an author through the admin api', done => {
        dashService.addAuthor(null).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/authors');
            done();
        });
    });

    it('removes an author through the admin api', done => {
        dashService.removeAuthor(1).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/authors/1');
            done();
        });
    });

    it('removes a post through the admin api', done => {
        dashService.removePost(1).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/posts/1');
            done();
        });
    });

    it('publishes a post through the admin api', done => {
        dashService.publishPost(1).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/posts/1/publish');
            done();
        });
    });

    it('unpublishes a post through the admin api', done => {
        dashService.unpublishPost(1).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/posts/1/unpublish');
            done();
        });
    });

    it('handles errors in the service', done => {
        dashService.getErrorResponse(new ResponseMock('error')).
            subscribe(res => {
                expect(res.endpoint).to.equal('error');
                done();
        });
    });
});

