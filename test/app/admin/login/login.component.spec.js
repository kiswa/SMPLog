/* globals expect RouterMock AuthServiceMock NotificationsServiceMock TitleMock */
require('reflect-metadata/Reflect.js');

var path = '../../../../build/admin/login/',
    Login = require(path + 'login.component.js').Login;

describe('Login', () => {
    var login,
        router,
        title;

    beforeEach(() => {
        router = new RouterMock();
        title = new TitleMock();

        login = new Login(AuthServiceMock, router,
            new NotificationsServiceMock(), title);
    });

    it('sets the title and checks authentication during OnInit', () => {
        login.ngOnInit();

        expect(title.getTitle()).to.equal('SMPLog - Admin');
        expect(router.path).to.equal('/admin/dash');
    });

    it('validates entries before login', done => {
        login.notes.noteAdded.subscribe(res => {
            expect(res.type).to.equal('error');
            done();
        });

        login.login();
    });

    it('logs in a user', () => {
        login.username = 'test';
        login.password = 'test';

        login.login();

        expect(router.path).to.equal('/admin/dash');
    });
});

