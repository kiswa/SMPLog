/* globals RxJs ResponseMock */

global.BlogServiceMock = {
    getDetails: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [{
                name: 'test',
                image: 'test'
            }]
        });
    },
    getPosts: () => {
        var res = new ResponseMock('posts').json();
        res.data = [[{
            id: 1,
            title: 'Test',
            text: 'Todo: Write this post.',
            is_published: '0',
            user_id: 1
        },
        {
            id: 3,
            title: 'Test 2',
            text: 'Words are hard.',
            is_published: '1',
            user_id: 1
        },
        {
            id: 2,
            title: 'Test 3',
            text: 'Whatever',
            is_published: '1',
            user_id: 1
        }]];

        return RxJs.Observable.of(res);
    },
    getPost: (slug) => {
        return RxJs.Observable.of({
            alerts: [],
            data: [{ id: 1, title: 'test', text: 'test' }]
        });
    },
    getAuthors: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [[ { id: 1, username: 'test' } ]]
        });
    },
    getAuthor: (id) => {
        return RxJs.Observable.of({
            alerts: [],
            data: [{ id: 1, username: 'test' }]
        });
    },
    getPostsByAuthor: (id) => {
        var res = new ResponseMock('posts').json();
        res.data = [[{
            id: 1,
            title: 'Test',
            text: 'Todo: Write this post.',
            is_published: '0',
            user_id: 1
        },
        {
            id: 3,
            title: 'Test 2',
            text: 'Words are hard.',
            is_published: '1',
            user_id: 1
        },
        {
            id: 2,
            title: 'Test 3',
            text: 'Whatever',
            is_published: '1',
            user_id: 1
        }]];

        return RxJs.Observable.of(res);
    }
};

