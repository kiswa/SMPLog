<?php
require_once __DIR__ . '/../Mocks.php';

use RedBeanPHP\R;
use Firebase\JWT\JWT;

class AuthorsTest extends PHPUnit_Framework_TestCase {
    private $authors;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        R::nuke();

        $this->authors = new Authors(new ContainerMock());
    }

    public function testGetAuthors() {
        $response = $this->authors->getAuthors(new RequestMock(),
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(0, count($response->data[0]));

        Auth::CreateInitialAdmin(new ContainerMock());
        $this->authors = new Authors(new ContainerMock());

        $response = $this->authors->getAuthors(new RequestMock(),
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(1, count($response->data[0]));
        $this->assertEquals('Anonymous', $response->data[0][0]['name']);
    }

    public function testGetAuthorNotFound() {
        $args = [];
        $args['id'] = 1;

        $response = $this->authors->getAuthor(new RequestMock(),
            new ResponseMock(), $args);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No author found for id 1.',
            $response->alerts[0]['text']);
    }

    public function testGetAuthorValid() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $args = [];
        $args['id'] = 1;

        $response = $this->authors->getAuthor(new RequestMock(),
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('Anonymous', $response->data[0]['name']);
    }

    public function testGetPosts() {
        Auth::CreateInitialAdmin(new ContainerMock());

        $args = [];
        $args['id'] = 1;

        $response = $this->authors->getPosts(new RequestMock(),
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(0, count($response->data[0]));

        $this->authors = new Authors(new ContainerMock());

        $post = R::dispense('post');
        $post->user_id = 1;
        $post->is_published = 1;
        $post->title = 'testing';
        R::store($post);

        $response = $this->authors->getPosts(new RequestMock(),
            new ResponseMock(), $args);

        $this->assertEquals('success', $response->status);
        $this->assertEquals(1, count($response->data[0]));
        $this->assertEquals('testing', $response->data[0][0]['title']);
    }

}

