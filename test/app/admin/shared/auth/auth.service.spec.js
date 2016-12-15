/* globals expect HttpMock */
require('reflect-metadata/Reflect.js');

var path = '../../../../../build/admin/shared/auth/',
    AuthService = require(path + 'auth.service.js').AuthService;

describe('AuthService', () => {
    var authService;

    beforeEach(() => {
        authService = new AuthService(HttpMock);
    });

    it('has a method to update the user', done=> {
        authService.updateUser({ id: 1 });

        authService.userChanged.subscribe(user => {
            expect(user.id).to.equal(1);
            done();
        });
    });

    it('authenticates a user through the admin api', done => {
        authService.authenticate().subscribe(test => {
            expect(test).to.equal(true);
            done();
        });
    });

    it('calls the api to login a user', () => {
        authService.login('test', 'test', true).subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/login');
        });
    });

    it('calls the api to logout a user', () => {
        authService.logout().subscribe(res => {
            expect(res.endpoint).to.equal('api/admin/logout');
        });
    });
});

