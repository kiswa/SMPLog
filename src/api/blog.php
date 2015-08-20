<?php
use RedBeanPHP\R;

class Blog extends ApiBase {
    public function __construct() {
        parent::__construct();
    }

    public function details() {
        $blogObj = new stdclass();
        $blog = R::load('blog', 1);

        if (!$blog->id) {
            $blog->desc = 'A blog published by SMPLog.';
        }

        if (empty($blog->name)) {
            $blog->name = 'SMPLog';
            R::store($blog);
        }

        $blogObj->name = $blog->name;
        $blogObj->desc = $blog->desc;
        $blogObj->image = $blog->image;

        $this->response->addData($blogObj);
        $this->response->status = 'success';

        $this->app->response->setBody($this->response->asJson());
    }
}
