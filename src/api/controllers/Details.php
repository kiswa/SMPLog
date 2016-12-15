<?php
use RedBeanPHP\R;

class Details extends BaseController {

    public function getDetails($request, $response, $args) {
        $details = R::load('detail', 1);

        if (!$details->id) {
            $details->name = 'SMPLog';
            $details->description = 'A blog published by SMPLog.';
            $details->image = '';

            R::store($details);
        }

        if (empty($details->name)) {
            $details->name = 'SMPLog';
            R::store($details);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($details->export());
        return $this->jsonResponse($response);
    }

}

