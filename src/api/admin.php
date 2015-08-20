<?php
require_once 'rss.php';

use RedBeanPHP\R;

class Admin extends ApiBase {
    public function __construct() {
        parent::__construct();

        $this->createInitialAdmin();
    }

    public function getAuthor() {
        $this->response->status = 'success';

        $author = $this->loadAuthor();
        $this->response->addData($author);

        $this->app->response->setBody($this->response->asJson());
    }

    public function authenticate() {
        if ($this->auth->validateToken($this->response, $this->user)) {
            $this->response->status = 'success';
        } else {
            $this->app->response->setStatus(401);
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function logIn() {
        $data = json_decode($this->app->environment['slim.input']);
        // Log in is always success; check alerts for status.
        $this->response->status = 'success';

        $expires = 1.5 * 60 * 60; // 1.5 hours

        $lookup = R::findOne('user', ' username = ? ', [$data->username]);
        if (null != $lookup) {
            $hash = password_hash($data->password, PASSWORD_BCRYPT,
                array('salt' => $lookup->salt));

            if ($lookup->password == $hash && $lookup->isActive) {
                $lookup->logins += 1;
                $lookup->lastLogin = time();
                $lookup->token = $this->auth->getToken($lookup->id, $expires);
                R::store($lookup);

                $this->response->addAlert('success', 'Sign In Successful');
                $this->response->addData($lookup->token);
            } else {
                $this->response->addAlert('error', 'Invalid username or password.');
            }
        } else {
            $this->response->addAlert('error', 'Invalid username or password.');
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function logOut() {
        if ($this->auth->validateToken($this->response, $this->user)) {
            if ($this->user != null) {
                $this->user->token = null;
                R::store($this->user);
            }

            $this->response->status = 'success';
            $this->response->addAlert('success', 'Sign Out Complete');
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function changePassword() {
        $data = json_decode($this->app->environment['slim.input']);

        if ($this->auth->validateToken($this->response, $this->user)) {
            $hash = password_hash($data->password, PASSWORD_BCRYPT,
                array('salt' => $this->user->salt));

            if ($hash == $this->user->password) {
                $this->user->password = password_hash($data->newPass, PASSWORD_BCRYPT,
                    array('salt' => $this->user->salt));
                R::store($this->user);

                $this->response->status = 'success';
                $this->response->addAlert('success', 'Password changed.');
            } else {
                $this->response->addAlert('error', 'Incorrect current password.');
            }
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function updateAuthor() {
        $data = json_decode($this->app->environment['slim.input']);

        if ($this->auth->validateToken($this->response, $this->user)) {
            $this->user->name = $data->name;
            $this->user->image = $data->image;
            R::store($this->user);

            $this->response->addData($this->loadAuthor());
            $this->response->status = 'success';
            $this->response->addAlert('success', 'Author updated.');
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function updateBlogData() {
        $data = json_decode($this->app->environment['slim.input']);

        if ($this->auth->validateToken($this->response, $this->user)
                && $this->user->isAdmin) {
            $blog = R::load('blog', 1);
            $blog->name = $data->name;
            $blog->image = $data->image;
            $blog->desc = $data->desc;

            R::store($blog);

            $blogObj = new stdclass();
            $blogObj->name = $blog->name;
            $blogObj->image = $blog->image;
            $blogObj->desc= $blog->desc;

            $rss = new RssGenerator();
            $rss->updateRss();

            $this->response->addData($blogObj);
            $this->response->status = 'success';
        }

        $this->app->response->setBody($this->response->asJson());
    }

    private function loadAuthor() {
        $author = new stdclass();

        if ($this->user != null) {
            $author->name = $this->user->name;
            $author->image = $this->user->image;
            $author->isAdmin = $this->user->isAdmin;
            $author->id = $this->user->id;
        }

        return $author;
    }

    private function createInitialAdmin() {
        if (!R::count('user')) {
            $admin = R::dispense('user');

            $admin->username = 'admin';
            $admin->isAdmin = true;
            $admin->isActive = true;
            $admin->name = 'Anonymous';
            $admin->image = '';
            $admin->logins = 0;
            $admin->lastLogin = time();
            $admin->salt = password_hash('admin' . time(), PASSWORD_BCRYPT);
            $admin->password = password_hash('admin', PASSWORD_BCRYPT,
                array('salt' => $admin->salt));

            R::store($admin);
        }
    }
}
