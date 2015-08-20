<?php
use RedBeanPHP\R;
use Firebase\JWT\JWT;

class Authorization {

    public function validateToken(&$jsonResponse, &$user) {
        $payload = null;
        $retVal = false;

        if ($this->checkDbToken()) {
            try {
                $jwt = getallheaders()['Authorization'];
                $payload = JWT::decode($jwt, $this->getJwtKey(), array('HS256'));
            } catch (Exception $e) { }

            if ($payload != null) {
                $retVal = true;
            }
        }

        if (!$retVal) {
            $jsonResponse->addAlert('error', 'Invalid Token');

            if ($user != null) {
                $user->token = null;
                R::store($user);
            }
        }

        return $retVal;
    }

    public function getUser() {
        $user = null;

        if (isset(getallheaders()['Authorization'])) {
            $jwt = getallheaders()['Authorization'];

            try {
                $payload = JWT::decode($jwt, $this->getJwtKey(), array('HS256'));
                $user = R::load('user', $payload->uid);

                if (!$user->id) {
                    $user = null;
                }
            } catch (Exception $e) { }
        }

        return $user;
    }

    public function getToken($id, $expires) {
        return JWT::encode(array(
            'exp' => time() + $expires,
            'uid' => $id
        ), $this->getJwtKey());
    }

    private function getJwtKey() {
        $key = R::load('jwt', 1);

        if (!$key->id) {
            $key->token = password_hash(strval(time()), PASSWORD_BCRYPT);
            R::store($key);
        }

        return $key->token;
    }

    private function checkDbToken() {
        $user = $this->getUser();

        if ($user != null) {
            if (isset(getallheaders()['Authorization'])) {
                return $user->token == getallheaders()['Authorization'];
            }
        }

        return false;
    }
}
