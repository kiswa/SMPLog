<?php
abstract class BaseController {
    protected $apiJson;
    protected $logger;
    protected $container;

    public function __construct($container) {
        $this->apiJson = new ApiJson();

        $this->logger = $container->get('logger');
        $this->container = $container;
    }

    public function jsonResponse($response, $status = 200) {
        return $response->withStatus($status)->withJson($this->apiJson);
    }

    public function secureRoute($requset, $response) {
        $response = Auth::ValidateToken($request, $response);
        $status = $response->getStatusCode();

        if ($status !== 200) {
            if ($status === 400) {
                $this->apiJson->addAlert('error',
                    'Authorization header missing.');
            } else {
                $this->apiJson->addAlert('error', 'Invalid API token.');
            }
        }

        return $status;
    }
}

