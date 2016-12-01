<?php
use RedBeanPHP\R;

class Posts extends BaseController {

    public function getPosts($request, $response, $args) {
        $posts = R::findAll('post', 'is_published = 1');

        foreach ($posts as $key => $post) {
            $posts[$key] = $post->export();
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($posts);

        return $this->jsonResponse($response);
    }

    public function getPost($request, $response, $args) {
        $id = (int) $args['id'];
        $post = R::load('post', $id);

        if (!$post->id) {
            $this->apiJson->addAlert('error',
                'No post found for id ' . $id . '.');
            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($post->export());

        return $this->jsonResponse($response);
    }

}

