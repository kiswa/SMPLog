<?php
use RedBeanPHP\R;
use Firebase\JWT\JWT;

class Auth extends BaseController {

    public static function CreateInitialAdmin($container) {
        if (!R::count('user')) {
            $admin = R::dispense('user');

            $admin->username = 'admin';
            $admin->is_admin = true;
            $admin->is_active = true;
            $admin->name = 'Anonymous';
            $admin->image = '';
            $admin->logins = 0;
            $admin->last_login = null;
            $admin->password_hash = password_hash('admin', PASSWORD_BCRYPT);
            $admin->active_token = null;

            R::store($admin);
        }
    }

    public static function CreateJwtKey() {
        $key = R::load('jwt', 1);

        // Don't create more than one secret key
        if ($key->id) {
            return;
        }

        // Generate a JWT signing key by hashing the current time.
        $key->secret = hash('sha512', strval(time()));

        R::store($key);
    }

    public static function ValidateToken($request, $response) {
        if (!$request->hasHeader('Authorization')) {
            return $response->withStatus(400);
        }

        $user = self::GetUser($request);

        if ($user === null) {
            return $response->withStatus(401);
        }

        $jwt = $request->getHeader('Authorization')[0];

        if ($user->active_token !== $jwt) {
            $user->active_token = '';
            R::store($user);

            return $response->withStatus(401);
        }

        return $response;
    }

    public static function GetUser($request) {
        $jwt = $request->getHeader('Authorization')[0];
        $payload = self::getJwtPayload($jwt);

        if ($payload === null) {
            return null;
        }

        $user = R::load('user', (int) $payload->uid);

        return $user;
    }

    public function login($request, $response, $args) {
        $data = json_decode($request->getBody());
        $user = R::findOne('user', 'username = ?', [$data->username]);

        if ($user === null) {
            $this->logger->addError('Login Attempt', [$data]);
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response, 401);
        }

        if (!password_verify($data->password, $user->password_hash)) {
            $this->logger->addError('Login Attempt ', [$data]);
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response, 401);
        }

        if (!$user->is_active) {
            $this->logger->addError('Login Attempt Inactive User ', [$data]);
            $this->apiJson->addAlert('error', 'This username is not active.');

            return $this->jsonResponse($response, 403);
        }

        $jwt = self::createJwt($user->id, ($data->remember ? 100 : 1));
        $user = R::load('user', $user->id);

        $user->active_token = $jwt;
        $user->last_login = time();
        $user->logins += 1;
        R::store($user);

        $this->apiJson->setSuccess();
        $this->apiJson->addData($this->sanitizeUser($user));

        return $this->jsonResponse($response);
    }

    public function logout($request, $response, $args) {
        if (!$request->hasHeader('Authorization')) {
            return $this->jsonResponse($response, 400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = self::getJwtPayload($jwt);

        if ($payload === null) {
            $this->apiJson->addAlert('error', 'Invalid access token.');

            return $this->jsonResponse($response, 401);
        }

        $user = R::load('user', $payload->uid);

        if ($user->id) {
            $user->active_token = '';
            R::store($user);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'You have been logged out.');

        return $this->jsonResponse($response);
    }

    public function authenticate($request, $response, $args) {
        if (!$request->hasHeader('Authorization')) {
            return $this->jsonResponse($response, 400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = self::getJwtPayload($jwt);

        if ($payload === null) {
            $this->apiJson->addAlert('error', 'Invalid access token.');

            return $this->jsonResponse($response, 401);
        }

        $user = R::load('user', $payload->uid);

        if ($user->active_token !== $jwt) {
            $this->apiJson->addAlert('error', 'Invalid access token.');

            return $this->jsonResponse($response, 401);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($this->sanitizeUser($user));

        return $this->jsonResponse($response);
    }

    private function sanitizeUser($user) {
        unset($user->password_hash);

        return $user->export();
    }

    private static function getJwtPayload($jwt) {
        try {
            $payload = JWT::decode($jwt, self::getJwtKey(), ['HS256']);
        } catch (Exception $ex) {
            return null;
        }

        return $payload;
    }

    private static function createJwt($userId, $mult = 1) {
        return JWT::encode(array(
                    'exp' => time() + (60 * 90) * $mult, // 90 minutes * $mult
                    'uid' => (int) $userId,
                    'mul' => $mult
                ), self::getJwtKey());
    }

    private static function getJwtKey() {
        self::CreateJwtKey();
        $key = R::load('jwt', 1);

        return $key->secret;
    }
}
