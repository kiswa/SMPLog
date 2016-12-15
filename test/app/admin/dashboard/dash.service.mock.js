/* globals RxJs ResponseMock */

global.DashServiceMock = {
    getPosts: () => {
        var res = new ResponseMock('posts').json();
        res.data = [[{
            id: 1,
            title: 'Test',
            text: 'Todo: Write this post.',
            is_published: '0'
        },
        {
            id: 3,
            title: 'Test 2',
            text: 'Words are hard.',
            is_published: '1'
        },
        {
            id: 2,
            title: 'Test 3',
            text: 'Whatever',
            is_published: '1'
        }]];

        return RxJs.Observable.of(res);
    },
    getDetails: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [{ description: 'test' }]
        });
    },
    getAuthors: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [[ { username: 'test' } ]]
        });
    },
    updateDetails: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [{ description: 'updated' }]
        });
    },
    updateAuthor: () => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success' }],
            data: [{ username: 'updated' }]
        });
    },
    addAuthor: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [{ username: 'test' }]
        });
    },
    removeAuthor: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [[]]
        });
    },
    removePost: id => {
        var res = new ResponseMock('posts').json();
        res.data = [[{
            id: 1,
            title: 'Test',
            text: 'Todo: Write this post.',
            is_published: 0
        }]];

        return RxJs.Observable.of(res);
    },
    unpublishPost: () => {
        var res = new ResponseMock('posts').json();
        res.data = [{
            id: 1,
            title: 'Test',
            text: 'Todo: Write this post.',
            is_published: '0'
        }];

        return RxJs.Observable.of(res);
    },
    publishPost: () => {
        var res = new ResponseMock('posts').json();
        res.data = [{
            id: 1,
            title: 'Test',
            text: 'Todo: Write this post.',
            is_published: '1'
        }];

        return RxJs.Observable.of(res);
    }
};

