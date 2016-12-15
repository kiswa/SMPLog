/* globals expect TitleMock BlogServiceMock */

var path = "../../../../build/blog/authors/",
    Authors = require(path + 'authors.component.js').Authors;

require('../blog.service.mock.js');

describe('Authors', () => {
    var authors;

    beforeEach(() => {
        var route = {
            snapshot: {
                params: {
                    id: 1
                }
            }
        };

        var sanitizer = {
            bypassSecurityTrustStyle(text) { return text; }
        };

        authors = new Authors(new TitleMock(), route,
            sanitizer, BlogServiceMock);
    });

    it('sets the header style when constructed', () => {
        expect(authors.headerStyle).to
            .equal('background: linear-gradient(rgba(0, 0, 0, 0.2), ' +
            'rgba(0, 0, 0, 0.2))');
    });

    it('implements ngOnInit', done => {
        authors.ngOnInit();

        BlogServiceMock.getDetails().subscribe(res => {
            expect(authors.author.id).to.equal(1);
            done();
        });
    });
});

