<?php

require_once 'authorization.php';
require_once 'jsonResponse.php';

class ApiBase {
    protected $app;
    protected $response;

    protected $auth;
    protected $user;

    function __construct() {
        $this->app = Slim\Slim::getInstance();
        $this->response = new JsonResponse();

        $this->auth = new Authorization();
        $this->user = $this->auth->getUser();
    }
}
