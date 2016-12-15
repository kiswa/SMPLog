<?php
require_once __DIR__ . '/../Mocks.php';

use RedBeanPHP\R;
use Firebase\JWT\JWT;

class AuthTest extends PHPUnit_Framework_TestCase {
    private $auth;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        R::nuke();

        $this->auth = new Auth(new ContainerMock());
    }

    public function testCreateInitialAdmin() {
        $this->assertEquals(0, R::count('user'));

        Auth::CreateInitialAdmin(new ContainerMock());

        $this->assertEquals(1, R::count('user'));
    }

    public function testCreateJwtKey() {
        $this->assertEquals(0, R::count('jwt'));

        Auth::CreateJwtKey();

        $this->assertEquals(1, R::count('jwt'));
    }

    public function testValidateTokenNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = Auth::ValidateToken($request, new ResponseMock());
        $this->assertEquals(400, $response->status);
    }

    public function testValidateTokenNoUser() {
        $request = new RequestMock();

        $response = Auth::ValidateToken($request, new ResponseMock());
        $this->assertEquals(401, $response->status);
    }

    public function testValidateTokenNoneActive() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $response = Auth::ValidateToken($request, new ResponseMock());
        $this->assertEquals(401, $response->status);
    }

    public function testValidateTokenValid() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $user = R::load('user', 1);
        $user->active_token = DataMock::getJwt();
        R::store($user);

        $request = new RequestMock();
        $request->header = [$user->active_token];

        $response = Auth::ValidateToken($request, new ResponseMock());
        $this->assertEquals(200, $response->status);
    }

    public function testLoginNoUser() {
        $request = new RequestMock();
        $request->payload = $this->getAdminLogin();

        $response = $this->auth->login($request, new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Invalid username or password.',
            $response->alerts[0]['text']);
    }

    public function testLoginBadPassword() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $admin = $this->getAdminLogin();
        $admin->password = 'notright';

        $request = new RequestMock();
        $request->payload = $admin;

        $response = $this->auth->login($request, new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Invalid username or password.',
            $response->alerts[0]['text']);
    }

    public function testLoginInactiveUser() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $admin = R::load('user', 1);
        $admin->is_active = false;
        R::store($admin);

        $request = new RequestMock();
        $request->payload = $this->getAdminLogin();

        $response = $this->auth->login($request, new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('This username is not active.',
            $response->alerts[0]['text']);
    }

    public function testLoginValid() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $request = new RequestMock();
        $request->payload = $this->getAdminLogin();

        $response = $this->auth->login($request, new ResponseMock(), null);
        $this->assertEquals('success', $response->status);
    }

    public function testLogoutNoAuth() {
        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->auth->logout($request, new ResponseMock(), null);
        $this->assertEquals('failure', $response->status);
    }

    public function testLogoutBadAuth() {
        $request = new RequestMock();

        $response = $this->auth->logout($request, new ResponseMock(), null);
        $this->assertEquals('failure', $response->status);
    }

    public function testLogoutValid() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $request = new RequestMock();
        $request->payload = $this->getAdminLogin();

        $response = $this->auth->login($request, new ResponseMock(), null);
        $jwt = $response->data[0]['active_token'];

        $request = new RequestMock();
        $request->header = [$jwt];

        $response = $this->auth->logout($request, new ResponseMock(), null);
        $this->assertEquals('success', $response->status);
    }

    public function testAuthenticateNoAuth() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $request = new RequestMock();
        $request->hasHeader = false;

        $response = $this->auth->authenticate($request,
            new ResponseMock(), null);
        $this->assertEquals('failure', $response->status);
    }

    public function testAuthenticateBadAuth() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $request = new RequestMock();

        $response = $this->auth->authenticate($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Invalid access token.',
            $response->alerts[0]['text']);
    }

    public function testAuthenticateBadToken() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $request = new RequestMock();
        $request->header = [DataMock::getJwt(2)];

        $response = $this->auth->authenticate($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('Invalid access token.',
            $response->alerts[0]['text']);
    }

    public function testAuthenticateValid() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $jwt = DataMock::getJwt();

        $user = R::load('user', 1);
        $user->active_token = $jwt;
        R::store($user);

        $request = new RequestMock();
        $request->header = [$jwt];

        $response = $this->auth->authenticate($request,
            new ResponseMock(), null);
        $this->assertEquals('success', $response->status);
    }

    private function getAdminLogin() {
        $data = new stdClass();
        $data->username = 'admin';
        $data->password = 'admin';
        $data->remember = false;

        return $data;
    }
}

