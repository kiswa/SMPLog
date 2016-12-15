/* globals expect RxJs */
require('reflect-metadata/Reflect.js');

var path = '../../../../build/admin/editor/',
    Editor = require(path + 'editor.component.js').Editor;

var EditorServiceMock = {
    getPost: (slug) => {
        return RxJs.Observable.of({
            data: [{
                id: 1,
                title: 'test',
                text: 'testing',
                is_published: '1'
            }]
        });
    }
};

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

        editor = new Editor(route, EditorServiceMock, sanitizer);
    });

    it('loads a post for editing in ngOnInit', () => {
        editor.ngOnInit();

        expect(editor.post.id).to.equal(1);
        expect(editor.post.title).to.equal('test');
        expect(editor.post.text).to.equal('testing');
        expect(editor.post.is_published).to.equal(true);
    });
});

