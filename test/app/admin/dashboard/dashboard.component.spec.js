/* globals expect DashServiceMock AuthServiceMock NotificationsServiceMock RouterMock */
require('reflect-metadata/Reflect.js');

var path = '../../../../build/admin/dashboard/',
    Dashboard = require(path + 'dashboard.component.js').Dashboard;

require('./dash.service.mock.js');

describe('Dashboard', () => {
    var dashboard,
        router;

    beforeEach(() => {
        router = new RouterMock();
        dashboard = new Dashboard(DashServiceMock, AuthServiceMock,
            new NotificationsServiceMock(), router);
    });

    it('loads data during OnInit', done => {
        dashboard.sort = 'asc';
        dashboard.ngOnInit();

        DashServiceMock.getPosts()
            .subscribe(response => {
                expect(dashboard.posts[0].id).to.equal(1);
                done();
            });
    });

    it('has a method to change the current tab', () => {
        expect(dashboard.tab).to.equal('posts');

        dashboard.changeTab('test');

        expect(dashboard.tab).to.equal('test');
    });

    it('updates blog details from the service', () => {
        dashboard.updateDetails();

        expect(dashboard.details.description).to.equal('updated');
    });

    it('updates author data from the service', () => {
        expect(dashboard.activeUser.username).to.equal('tester');

        dashboard.updateAuthor();

        expect(dashboard.activeUser.username).to.equal('updated');
    });

    it('validates new authors before adding', done => {
        var lastCall = false;

        dashboard.notes.noteAdded
            .subscribe(note => {
                expect(note.type).to.equal('error');

                if (lastCall) done();
            });

        dashboard.newUser = {
            username: ''
        };
        dashboard.addAuthor();

        dashboard.newUser = {
            username: 'test',
            password: '',
            verify: ''
        };
        dashboard.addAuthor();

        dashboard.newUser = {
            username: 'test',
            password: 'test',
            verify: 'oops'
        };
        lastCall = true;
        dashboard.addAuthor();
    });

    it('can add a new author', () => {
        dashboard.newUser = {
            username: 'test',
            password: 'test',
            verify: 'test'
        };

        dashboard.addAuthor();

        expect(dashboard.authors.username).to.equal('test');
    });

    it('can remove an author', () => {
        dashboard.removeAuthor(1);

        expect(dashboard.authors.length).to.equal(0);
    });

    it('validates password change requests', done => {
        var lastCall = false;

        dashboard.notes.noteAdded
            .subscribe(note => {
                expect(note.type).to.equal('error');

                if (lastCall) done();
            });

        dashboard.changePass = {
            update: '',
            verify: ''
        };
        dashboard.changePassword();

        dashboard.changePass = {
            update: 'test',
            verify: 'oops'
        };
        lastCall = true;
        dashboard.changePassword();
    });

    it('can change the user\'s password', done => {
        dashboard.activeUser = { username: 'admin' };
        dashboard.changePass = {
            current: 'oldPass',
            update: 'test',
            verify: 'test'
        };

        dashboard.notes.noteAdded
            .subscribe(note => {
                expect(note.type).to.equal('success');
                done();
            });

        dashboard.changePassword();
    });

    it('can remove a post through the service', () => {
        dashboard.removePost(1);

        expect(dashboard.posts[0].id).to.equal(1);
    });

    it('toggles the published status of a post', () => {
        dashboard.fullPosts = dashboard.posts = [{
            id: 1,
            title: 'Test',
            text: 'Todo: Write this post.',
            is_published: true
        }];

        dashboard.toggleIsPublished(1);

        expect(dashboard.posts[0].is_published).to.equal(false);

        dashboard.toggleIsPublished(1);

        expect(dashboard.posts[0].is_published).to.equal(true);
    });

    it('navigates to edit a post', () => {
        dashboard.editPost('test-post');

        expect(router.path).to.equal('/admin/post/test-post');
    });

    it('sorts posts by id', () => {
        dashboard.posts = [
            { id: 1 },
            { id: 3 },
            { id: 2 }
        ];

        dashboard.sortPosts();
        expect(dashboard.posts[0].id).to.equal(3);
    });

    it('filters posts by published status', () => {
        dashboard.fullPosts = [
            { id: 1, is_published: false },
            { id: 3, is_published: true },
            { id: 2, is_published: false }
        ];
        dashboard.show = 'pub';

        dashboard.filterPosts();

        expect(dashboard.posts[0].is_published).to.equal(true);
    });

    it('filters posts by title', () => {
        dashboard.fullPosts = [
            { id: 1, title: 'Test' },
            { id: 3, title: 'bar' },
            { id: 2, title: 'foo' }
        ];

        dashboard.titleSearch();
        expect(dashboard.posts[0].id).to.equal(3);

        dashboard.titleSearch('test');
        expect(dashboard.posts[0].id).to.equal(1);
    });
});

