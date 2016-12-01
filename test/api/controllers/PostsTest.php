<?php
require_once __DIR__ . '/../Mocks.php';

use RedBeanPHP\R;
use Firebase\JWT\JWT;

class PostsTest extends PHPUnit_Framework_TestCase {
    private $posts;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        R::nuke();

        $this->posts = new Posts(new ContainerMock());
    }

    public function testGetPosts() {
        $post = R::dispense('post');
        $post->title = 'test';
        $post->is_published = 1;
        R::store($post);

        $response = $this->posts->getPosts(new RequestMock(),
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(1, count($response->data[0]));
    }

    public function testGetPost() {
        $args = [];
        $args['id'] = 1;

        $response = $this->posts->getPost(new RequestMock(),
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No post found for id 1.',
            $response->alerts[0]['text']);

        $post = R::dispense('post');
        $post->title = 'test';
        R::store($post);

        $this->posts = new Posts(new ContainerMock());
        $response = $this->posts->getPost(new RequestMock(),
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('test', $response->data[0]['title']);
    }

}

