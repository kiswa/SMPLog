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
        $request = new RequestMock();

        $response = $this->posts->getPost($request,
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No post found for slug .',
            $response->alerts[0]['text']);

        $post = R::dispense('post');
        $post->title = 'test';
        $post->slug = 'test';
        R::store($post);

        $request = new RequestMock('test');

        $this->posts = new Posts(new ContainerMock());
        $response = $this->posts->getPost($request,
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('test', $response->data[0]['title']);
    }

}

