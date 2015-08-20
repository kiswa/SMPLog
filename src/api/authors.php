<?php
use RedBeanPHP\R;

class Authors extends ApiBase {
    public function __construct() {
        parent::__construct();
    }

    public function getAuthors() {
        $authors = R::findAll('user');

        $data = [];
        foreach($authors as $author) {
            $data[] = $this->loadAuthor($author);
        }

        $this->response->addData($data);
        $this->response->status = 'success';

        $this->app->response->setBody($this->response->asJson());
    }

    public function getAuthor($userId) {
        $author = R::load('user', $userId);

        $this->response->addData($this->loadAuthor($author));
        $this->response->status = 'success';

        $this->app->response->setBody($this->response->asJson());
    }

    public function newAuthor() {
        $data = json_decode($this->app->environment['slim.input']);

        if ($this->auth->validateToken($this->response, $this->user)) {
            $author = R::dispense('user');

            $author->username = $data->username;
            $author->isAdmin = false;
            $author->isActive = true;
            $author->name = 'Anonymous';
            $author->image = '';
            $author->logins = 0;
            $author->lastLogin = time();
            $author->salt = password_hash($author->username . time(), PASSWORD_BCRYPT);
            $author->password = password_hash($data->password, PASSWORD_BCRYPT,
                array('salt' => $author->salt));

            R::store($author);

            $this->response->status = 'success';
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function removeAuthor() {
        $data = json_decode($this->app->environment['slim.input']);

        if ($this->auth->validateToken($this->response, $this->user) &&
                $this->user->isAdmin) {
            $author = R::load('user', $data->id);

            if ($author->id) {
                $author->isActive = false;

                foreach($author->ownPostList as $post) {
                    $post->is_published = false;
                    R::store($post);
                }

                R::store($author);

                $this->response->status = 'success';
            }
        }

        $this->app->response->setBody($this->response->asJson());
    }

    private function loadAuthor($bean) {
        $author = new stdclass();

        $author->name = $bean->name;
        $author->username = $bean->username;
        $author->image = $bean->image;
        $author->isAdmin = $bean->isAdmin;
        $author->isActive = $bean->isActive;
        $author->id = $bean->id;
        $author->postCount = count($bean->ownPostList);

        return $author;
    }
}
