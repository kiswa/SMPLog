<?php
require_once __DIR__ . '/../Mocks.php';

use RedBeanPHP\R;
use Firebase\JWT\JWT;

class AdminTest extends PHPUnit_Framework_TestCase {
    private $admin;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        R::nuke();
        Auth::CreateInitialAdmin(new ContainerMock());

        $this->admin = new Admin(new ContainerMock());
    }

    public function testGetAuthorsNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->getAuthors($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testGetAuthorsBadToken() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $response = $this->admin->getAuthors($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Invalid API token.',
            $response->alerts[0]['text']);
    }

    public function testGetAuthorsValidNotAdmin() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $response = $this->admin->getAuthors($request,
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(1, count($response->data));
    }

    public function testGetAuthorsValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $response = $this->admin->getAuthors($request,
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(1, count($response->data));
    }

    public function testAddAuthorBadToken() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $response = $this->admin->addAuthor($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Invalid API token.',
            $response->alerts[0]['text']);
    }

    public function testAddAuthorNotAdmin() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $response = $this->admin->addAuthor($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Only admin users may add a new user.',
            $response->alerts[0]['text']);
    }

    public function testAddAuthorNameInUse() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $payload = new stdClass();
        $payload->username = 'admin';

        $request = new RequestMock();
        $request->header = [$jwt];
        $request->payload = $payload;

        $response = $this->admin->addAuthor($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Username already exists. ' .
            'Change the username and try again.',
            $response->alerts[0]['text']);
    }

    public function testAddAuthorValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $payload = new stdClass();
        $payload->username = 'test';
        $payload->is_admin = false;
        $payload->name = 'John Q. Test';
        $payload->password = 'testing';

        $request = new RequestMock();
        $request->header = [$jwt];
        $request->payload = $payload;

        $response = $this->admin->addAuthor($request,
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('New user test added.',
            $response->alerts[0]['text']);
        $this->assertEquals(2, count($response->data[0]));
    }

    public function testGetAuthorNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->getAuthor($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testGetAuthorNotFound() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 3;

        $response = $this->admin->getAuthor($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No author found for id 3.',
            $response->alerts[0]['text']);
    }

    public function testGetAuthorAdminByNonAdmin() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->getAuthor($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('You must be an admin to request that user.',
            $response->alerts[0]['text']);
    }

    public function testGetAuthorValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->getAuthor($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('admin', $response->data[0]['username']);
    }

    public function testUpdateAuthorNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->updateAuthor($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testUpdateAuthorNotFound() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 3;

        $response = $this->admin->updateAuthor($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No author found for id 3.',
            $response->alerts[0]['text']);
    }

    public function testUpdateAuthorAdminByNonAdmin() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->updateAuthor($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('You must be an admin to update that user.',
            $response->alerts[0]['text']);
    }

    public function testUpdateAuthorUsernameInUse() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $user = R::dispense('user');
        $user->username = 'changeme';
        R::store($user);

        $update = new stdClass();
        $update->username = 'admin';

        $request = new RequestMock();
        $request->header = [$jwt];
        $request->payload = $update;

        $args = [];
        $args['id'] = 2; // The user created above

        $response = $this->admin->updateAuthor($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Username already exists. ' .
            'Change the username and try again.',
            $response->alerts[0]['text']);
    }

    public function testUpdateAuthorValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $user = R::dispense('user');
        $user->username = 'changeme';
        R::store($user);

        $update = new stdClass();
        $update->username = 'updated';
        $update->password = 'changed';

        $request = new RequestMock();
        $request->header = [$jwt];
        $request->payload = $update;

        $args = [];
        $args['id'] = 2; // The user created above

        $response = $this->admin->updateAuthor($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('User updated updated.',
            $response->alerts[0]['text']);
    }

    public function testRemoveAuthorNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->removeAuthor($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testRemoveAuthorNotAdmin() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->removeAuthor($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Only admin users may remove a user.',
            $response->alerts[0]['text']);
    }

    public function testRemoveAuthorValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->username = 'deleteme';
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 2; // The new user above

        $response = $this->admin->removeAuthor($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(1, R::count('user'));
    }

    public function testUpdateDetailsNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->updateDetails($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testUpdateDetailsNotAdmin() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $response = $this->admin->updateDetails($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Only admin users may update blog details.',
            $response->alerts[0]['text']);
    }

    public function testUpdateDetailsValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $payload = new stdClass();
        $payload->name = 'new blog name';

        $request = new RequestMock();
        $request->header = [$jwt];
        $request->payload = $payload;

        $response = $this->admin->updateDetails($request,
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('Blog details updated.',
            $response->alerts[0]['text']);
        $this->assertEquals('new blog name', $response->data[0]['name']);
    }

    public function testGetPostsNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->getPosts($request, new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testGetPostsValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $post = R::dispense('post');
        $post->user_id = 1;
        R::store($post);

        $request = new RequestMock();
        $request->header = [$jwt];

        $response = $this->admin->getPosts($request, new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(1, count($response->data[0]));

        $this->admin = new Admin(new ContainerMock());
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $response = $this->admin->getPosts($request, new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(0, count($response->data[0]));
    }

    public function testAddPostNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->addPost($request, new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testAddPostValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $post = new stdClass();
        $post->title = 'Testing';
        $post->text = 'This is **Markdown**.';
        $post->publish = true;

        $request = new RequestMock();
        $request->header = [$jwt];
        $request->payload = $post;

        $response = $this->admin->addPost($request, new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('Post Testing saved.',
            $response->alerts[0]['text']);

        // Send the same post again. It should have a unique slug
        $this->admin = new Admin(new ContainerMock());
        $response = $this->admin->addPost($request, new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $test = R::load('post', 2);
        $this->assertEquals('testing-2', $test->slug);
    }

    public function testUpdatePostNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->updatePost($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testUpdatePostInvalid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->updatePost($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No post found for id 1.',
            $response->alerts[0]['text']);
    }

    public function testUpdatePostNotAllowed() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $post = R::dispense('post');
        $post->user_id = 1;
        R::store($post);

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->updatePost($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('You cannot edit this post.',
            $response->alerts[0]['text']);
    }

    public function testUpdatePostValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $post = R::dispense('post');
        $post->user_id = 1;
        R::store($post);

        $args = [];
        $args['id'] = 1;

        $post = new stdClass();
        $post->title = 'Testing';
        $post->text = 'This is **Markdown**.';
        $post->publish = true;

        $request = new RequestMock();
        $request->header = [$jwt];
        $request->payload = $post;

        $response = $this->admin->updatePost($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('Testing', $response->data[0]['title']);
    }

     public function testRemovePostNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->removePost($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
     }

    public function testRemovePostInvalid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->removePost($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No post found for id 1.',
            $response->alerts[0]['text']);
    }

    public function testRemovePostNotAllowed() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $post = R::dispense('post');
        $post->user_id = 1;
        R::store($post);

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->removePost($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('You cannot remove this post.',
            $response->alerts[0]['text']);
    }

    public function testRemovePostValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $post = R::dispense('post');
        $post->title = 'Test';
        $post->user_id = 1;
        R::store($post);

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->removePost($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('Post Test removed.',
            $response->alerts[0]['text']);
    }

    public function testPublishPostNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->publishPost($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testPublishPostInvalid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->publishPost($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No post found for id 1.',
            $response->alerts[0]['text']);
    }

    public function testPublishPostNotAllowed() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $post = R::dispense('post');
        $post->user_id = 1;
        R::store($post);

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->publishPost($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('You cannot publish this post.',
            $response->alerts[0]['text']);
    }

    public function testPublishPostValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $post = R::dispense('post');
        $post->title = 'Test';
        $post->user_id = 1;
        $post->is_published = false;
        R::store($post);

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->publishPost($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('Post Test published.',
            $response->alerts[0]['text']);
    }

    public function testUnpublishPostNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->admin->unpublishPost($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Authorization header missing.',
            $response->alerts[0]['text']);
    }

    public function testUnpublishPostInvalid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->unpublishPost($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No post found for id 1.',
            $response->alerts[0]['text']);
    }

    public function testUnpublishPostNotAllowed() {
        $jwt = DataMock::getJwt(2);

        $user = R::dispense('user');
        $user->is_admin = false;
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $post = R::dispense('post');
        $post->user_id = 1;
        R::store($post);

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->unpublishPost($request,
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('You cannot unpublish this post.',
            $response->alerts[0]['text']);
    }

    public function testUnpublishPostValid() {
        $jwt = DataMock::getJwt();
        $this->setAdminToken($jwt);

        $request = new RequestMock();
        $request->header = [$jwt];

        $post = R::dispense('post');
        $post->title = 'Test';
        $post->user_id = 1;
        $post->is_published = false;
        R::store($post);

        $args = [];
        $args['id'] = 1;

        $response = $this->admin->unpublishPost($request,
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('Post Test unpublished.',
            $response->alerts[0]['text']);
    }

    private function setAdminToken($jwt) {
        $user = R::load('user', 1);
        $user->active_token = $jwt;

        R::store($user);
    }
}

