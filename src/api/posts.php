<?php
require_once 'rss.php';

use RedBeanPHP\R;

class Posts extends ApiBase {
    public function __construct() {
        parent::__construct();
    }

    public function getPosts() {
        $posts = R::find('post', ' is_published = 1 ORDER BY publish_date DESC ');

        $this->response->addData($this->loadPosts($posts));
        $this->response->status = 'success';

        $this->app->response->setBody($this->response->asJson());
    }

    public function getPost($slug) {
        $post = R::findOne('post', ' slug = ?  ', [ $slug ]);

        if ($post == null) {
            $this->response->status = 'failure';
            $this->response->addAlert('error', 'Post not found.');
        } else {
            $this->response->addData($this->loadPost($post));
            $this->response->status = 'success';
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function getPostsByAuthor($author) {
        $posts = R::findAll('post', ' is_published = 1 AND user_id = ? ORDER BY publish_date DESC ', [ $author ]);

        $this->response->addData($this->loadPosts($posts));
        $this->response->status = 'success';

        $this->app->response->setBody($this->response->asJson());
    }

    public function getAllPostsByAuthor($author) {
        if ($this->auth->validateToken($this->response, $this->user)) {
            $posts = R::findAll('post', ' user_id = ? ', [ $author ]);

            $this->response->addData($this->loadPosts($posts));
            $this->response->status = 'success';
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function savePost() {
        $data = json_decode($this->app->environment['slim.input']);

        if ($this->auth->validateToken($this->response, $this->user)) {
            // If it's new, the id will be 0, which makes this
            // the same as calling R::dispense('post');
            $post = R::load('post', $data->id);

            $post->title = $data->title;
            $post->text = $data->text;

            if ($post->id) {
                R::store($post);
            } else { // New post
                $post->isPublished = false;
                $post->slug = $this->create_unique_slug($post->title);

                $this->user->ownPostList[] = $post;
                R::store($this->user);
            }

            $retVal = new stdclass();
            $retVal->id = $post->id;

            $this->response->status = 'success';
            $this->response->addData($retVal);
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function publishPost() {
        $data = json_decode($this->app->environment['slim.input']);

        if ($this->auth->validateToken($this->response, $this->user)) {
            // If it's new, the id will be 0, which makes this
            // the same as calling R::dispense('post');
            $post = R::load('post', $data->id);

            $post->isPublished = true;
            $post->publishDate = time();

            $post->title = $data->title;
            $post->text = $data->text;

            // Only add to user's posts if new post.
            if ($data->id) {
                R::store($post);
            } else {
                $post->slug = $this->create_unique_slug($post->title);
                $this->user->ownPostList[] = $post;
                R::store($this->user);
            }

            $rss = new RssGenerator();
            $rss->updateRss();

            $retVal = new stdclass();
            $retVal->id = $post->id;

            $this->response->status = 'success';
            $this->response->addData($retVal);
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function setPublished() {
        $data = json_decode($this->app->environment['slim.input']);

        if ($this->auth->validateToken($this->response, $this->user)) {
            $post = R::load('post', $data->postId);

            if ($post->id) {
                $post->isPublished = true;
                $post->publishDate = time();

                R::store($post);

                $rss = new RssGenerator();
                $rss->updateRss();

                $this->response->status = 'success';
                $this->response->addData($this->loadPost($post));
            }
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function setUnpublished() {
        $data = json_decode($this->app->environment['slim.input']);

        if ($this->auth->validateToken($this->response, $this->user)) {
            $post = R::load('post', $data->postId);

            if ($post->id) {
                $post->isPublished = false;
                $post->publishDate = time();

                R::store($post);

                $rss = new RssGenerator();
                $rss->updateRss();

                $this->response->status = 'success';
                $this->response->addData($this->loadPost($post));
            }
        }

        $this->app->response->setBody($this->response->asJson());
    }

    public function deletePost($postId) {
        if ($this->auth->validateToken($this->response, $this->user)) {
            $post = R::load('post', $postId);

            if ($post->id) {
                R::trash($post);

                $rss = new RssGenerator();
                $rss->updateRss();

                $this->response->status = 'success';
                $this->response->addAlert('success', 'Post deleted.');
            }
        }

        $this->app->response->setBody($this->response->asJson());
    }

    private function loadPosts($posts) {
        $data = [];
        foreach($posts as $post) {
            $data[] = $this->loadPost($post);
        }

        return $data;
    }

    private function loadPost($post) {
        $postObj = new stdclass();

        $postObj->id = $post->id;
        $postObj->title = $post->title;
        $postObj->slug = $post->slug;
        $postObj->isPublished = $post->is_published;
        $postObj->publishDate = $post->publish_date;
        $postObj->author = $post->user_id;
        $postObj->text = $post->text;

        return $postObj;
    }

    private function create_unique_slug($str) {
        $slug = $this->create_slug($str);

        $check = R::findOne('post', ' slug = ? ', [ $slug ]);

        // Every time a post has the same title, it just gets a '-s'
        // added to the end. So, try to make unique titles.
        if ($check !== null) {
            $slug = $slug . '-s';
        }

        return $slug;
    }

    private function create_slug($str) {
        if($str !== mb_convert_encoding(
            mb_convert_encoding($str, 'UTF-32', 'UTF-8'), 'UTF-8', 'UTF-32')) {
            $str = mb_convert_encoding($str, 'UTF-8', mb_detect_encoding($str));
        }

        $str = htmlentities($str, ENT_NOQUOTES, 'UTF-8');
        $str = preg_replace('`&([a-z]{1,2})(acute|uml|circ|grave|ring|cedil|slash|tilde|caron|lig);`i', '\\1', $str);
        $str = html_entity_decode($str, ENT_NOQUOTES, 'UTF-8');
        $str = preg_replace(array('`[^a-z0-9]`i','`[-]+`'), '-', $str);
        $str = strtolower(trim($str, '-'));

        return $str;
    }
}
