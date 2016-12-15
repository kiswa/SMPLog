<?php
use RedBeanPHP\R;

class Posts extends BaseController {

    public function getPosts($request, $response, $args) {
        $posts = R::findAll('post', 'is_published = 1');

        $data = [];
        foreach ($posts as $post) {
            $data[] = $post->export();
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($data);

        return $this->jsonResponse($response);
    }

    public function getPost($request, $response, $args) {
        $route = $request->getAttribute('route');
        $slug = $route->getArgument('slug');

        $post = array_shift(R::find('post', ' slug = ? ', [ $slug ]));

        if (!$post->id) {
            $this->apiJson->addAlert('error',
                'No post found for slug ' . $slug . '.');
            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($post->export());

        return $this->jsonResponse($response);
    }

}

