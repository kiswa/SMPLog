<?php
use RedBeanPHP\R;

class Authors extends BaseController {

    public function getAuthors($request, $response, $args) {
        $authors = $this->getAuthorsCleaned();

        $this->apiJson->setSuccess();
        $this->apiJson->addData($authors);

        return $this->jsonResponse($response);
    }

    public function getAuthor($request, $response, $args) {
        $author = R::findOne('user', 'id = ?', [ $args['id'] ]);

        if (!$author) {
            $this->apiJson->addAlert('error',
                'No author found for id ' . $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $this->unsetProperties($author);

        $this->apiJson->setSuccess();
        $this->apiJson->addData($author->export());

        return $this->jsonResponse($response);
    }

    public function getPosts($request, $response, $args) {
        $posts = R::findAll('post', 'user_id = ? and is_published = 1', [ $args['id'] ]);

        $data = [];
        foreach ($posts as $key => $post) {
            $data[] = $post->export();
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($data);

        return $this->jsonResponse($response);
    }

    private function getAuthorsCleaned() {
        $users = R::findAll('user', 'is_active = 1');

        $data = [];
        foreach($users as $key => $user) {
            $this->unsetProperties($user);

            $data[] = $user->export();
        }

        return $data;
    }

    /**
     * Authors returned only need id, name, and image.
     */
    private function unsetProperties(&$user) {
            unset($user->username);
            unset($user->is_admin);
            unset($user->is_active);
            unset($user->logins);
            unset($user->last_login);
            unset($user->password_hash);
            unset($user->active_token);
    }

}

