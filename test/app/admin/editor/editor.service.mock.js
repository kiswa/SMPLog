/* globals RxJs */

global.EditorServiceMock = {
    getPost: () => {
        return RxJs.Observable.of({
            data: [{
                id: 1,
                title: 'test',
                text: 'testing',
                is_published: '1'
            }]
        });
    },
    publishPost: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [{
                id: 1,
                title: 'test',
                text: 'testing',
                is_published: '1'
            }]
        });
    },
    unpublishPost: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [{
                id: 1,
                title: 'test',
                text: 'testing',
                is_published: '0'
            }]
        });
    },
    addPost: () => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success', text: 'added'}],
            data: [{
                id: 1,
                title: 'added',
                text: 'added post',
                is_published: '0'
            }]
        });
    },
    updatePost: () => {
        return RxJs.Observable.of({
            alerts: [],
            data: [{
                id: 1,
                title: 'updated',
                text: 'updated post',
                is_published: '0'
            }]
        });
    }
};

