<?php
use RedBeanPHP\R;

class Details extends BaseController {

    public function getDetails($request, $response, $args) {
        $details = R::load('detail', 1);

        if (!$details->id) {
            $this->apiJson->addAlert('error', 'No blog details found.');
            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($details);
        return $this->jsonResponse($response);
    }

}

