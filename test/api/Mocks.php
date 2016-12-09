<?php

class AppMock {

    public function getContainer() {
        return new ContainerMock();
    }

}

$app = new AppMock();

class DataMock {
    public static function getJwt($uid = 1) {
        Auth::CreateJwtKey();

        $key = RedBeanPHP\R::load('jwt', 1);

        $jwt = Firebase\JWT\JWT::encode(array(
                'exp' => time() + (60 * 90), // 90 minutes
                'uid' => $uid,
                'mul' => 1
            ), $key->secret);

        return $jwt;
    }
}

class ContainerMock {

    public function get() {
        return new LoggerMock();
    }

}

class LoggerMock {

    public function addInfo() {
    }

    public function addError() {
        // Uncomment to log errors to file
        // The tests cover errors, so there will be plenty to sift through
        // $msg = func_get_arg(0);
        // $err = 'API ERROR: ' . $msg . PHP_EOL;

        // $objs = func_get_args();
        // array_splice($objs, 0, 1);

        // ob_start();
        // foreach($objs as $obj) {
        //     var_dump($obj);
        // }
        // $strings = ob_get_clean();

        // file_put_contents('tests.log', [$err, $strings], FILE_APPEND);
    }

}

class RequestMock {
    public $invalidPayload = false;
    public $payload = null;
    public $hasHeader = true;
    public $header = null;
    public $throwInHeader = false;
    public $routeMock = null;

    public function __construct($arg = '') {
        $this->routeMock = new RouteMock($arg);
    }

    public function getBody() {
        if ($this->invalidPayload) {
            return '{}';
        }

        if ($this->payload) {
            return json_encode($this->payload);
        }

        return json_encode('{}'); // TODO: Set default return
    }

    public function hasHeader() {
        return $this->hasHeader;
    }

    public function getHeader($header) {
        if ($this->throwInHeader) {
            throw new Exception();
        }

        if ($this->header) {
            return $this->header;
        }

        return $header;
    }

    public function getAttribute($arg) {
        return $this->routeMock;
    }

}

class RouteMock {
    public $argument;

    public function __construct($arg = '') {
        $this->argument = $arg;
    }

    public function getArgument() {
        return $this->argument;
    }

}

class ResponseMock {
    public $status = 200;
    public $body;

    public function __construct() {
        $this->body = new RequestBodyMock();
    }

    public function withJson($apiJson) {
        return $apiJson;
    }

    public function withStatus($status) {
        $this->status = $status;

        return $this;
    }

    public function getStatusCode() {
        return $this->status;
    }

    public function getBody() {
        return $this->body;
    }

}

class RequestBodyMock {
    public $data;

    public function __toString() {
        return $this->data;
    }

    public function write($string) {
        $this->data = $string;
    }

}

