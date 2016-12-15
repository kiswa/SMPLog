/* globals expect RouterMock AuthServiceMock NotificationsServiceMock TitleMock */
require('reflect-metadata/Reflect.js');

var path = '../../../../../build/admin/shared/admin-nav/',
    AdminNav = require(path + 'admin-nav.component.js').AdminNav;

describe('AdminNav', () => {
    var adminNav,
        router,
        title;

    beforeEach(() => {
        router = new RouterMock();
        title = new TitleMock();

        adminNav = new AdminNav(AuthServiceMock, router,
            new NotificationsServiceMock(), title);
    });

    it('sets the title in the constructor', () => {
        expect(title.getTitle()).to.equal('SMPLog - Admin');
    });

    it('calls the auth service to logout', () => {
        adminNav.logout();
        expect(router.path).to.equal('test');
    });

    it('navigates to new pages', () => {
        adminNav.navigateTo('testing');
        expect(router.path).to.equal('/admin/testing');
    });
});

