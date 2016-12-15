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
});

