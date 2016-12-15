/* globals RxJs */
var MockBrowser = require('mock-browser').mocks.MockBrowser,
    mockBrowser = new MockBrowser(),
    chai = require('chai');

global.window = {};

global.RxJs = require('rxjs/Rx');
global.expect = chai.expect;
global.document = mockBrowser.getDocument();
global.localStorage = mockBrowser.getLocalStorage();

global.confirm = function() { return true; };
global.marked = function(text) { return text; };
global.marked.Renderer = function() { return {
    code: function(code) { return code; }
}};
global.marked.setOptions = function() {};

global.TitleMock = function() {
    var title = '';

    return {
        getTitle: () => {
            return title;
        },
        setTitle: text => {
            title = text;
        }
    };
};

global.RouterMock = function() {
    return {
        path: 'test',
        url: 'test',
        navigate: function(arr) {
            this.path = arr[0];
        }
    };
};

global.NotificationsServiceMock = function() {
    var notes = new RxJs.Subject();

    return {
        noteAdded: notes.asObservable(),
        add: note => {
            notes.next(note);
        }
    };
};

global.ResponseMock = function(endpoint) {
    return {
        json: () => {
            return {
                alerts: [],
                data: [],
                status: 'success',
                endpoint
            };
        }
    };
};

global.AuthServiceMock = {
    userChanged: RxJs.Observable.of({
        id: 1,
        username: 'tester',
        name: 'Test Me'
    }),
    login: () => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success', text: 'Logged in' }],
            status: 'success'
        });
    },
    logout: () => {
        return RxJs.Observable.of({
            alerts: [ 'Logged out' ]
        });
    },
    authenticate: () => {
        return RxJs.Observable.of(true);
    }
};

global.HttpMock = {
    post: (url, data) => {
        var response = new global.ResponseMock(url);
        return RxJs.Observable.of(response);
    },
    get: url => {
        var response = new global.ResponseMock(url);
        return RxJs.Observable.of(response);
    },
    delete: url => {
        var response = new global.ResponseMock(url);
        return RxJs.Observable.of(response);
    }
};

