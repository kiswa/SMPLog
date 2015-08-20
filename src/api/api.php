<?php
require_once 'vendor/autoload.php';

use Slim\Slim;
use RedBeanPHP\R;

// Slim Framework initialization
$app = new Slim();
$app->response->headers->set('Content-Type', 'application/json');

// Handle exceptions
function exceptionHandler($ex) {
    $response = new stdclass();

    $response->message = "API Error";
    $response->data = $ex->getMessage();
    $response->trace = $ex->getTrace();

    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode($response);
}
set_exception_handler('exceptionHandler');

// Handle 404s
$app->notFound(function() use ($app) {
    $app->response->setStatus(404);
    $app->response->setBody('{ "message": "Matching API call not found" }');
});

// Setup RedBeanPHP
R::setup('sqlite:smplog.db');

// Create RSS on first run
if (!file_exists('../rss/rss.xml')) {
    require_once 'rss.php';
    $rss = new RssGenerator();
    $rss->updateRss();
}

// Include routing objects
require_once 'apiBase.php';
require_once 'admin.php';
require_once 'blog.php';
require_once 'posts.php';
require_once 'authors.php';

// API routes
$app->get('/admin/author', 'Admin:getAuthor');
$app->get('/admin/posts/:author', 'Posts:getAllPostsByAuthor');
$app->post('/admin/newAuthor', 'Authors:newAuthor');
$app->post('/admin/removeAuthor', 'Authors:removeAuthor');

$app->post('/admin/authenticate', 'Admin:authenticate');
$app->post('/admin/login', 'Admin:logIn');
$app->post('/admin/logout', 'Admin:logOut');
$app->post('/admin/changePassword', 'Admin:changePassword');
$app->post('/admin/updateAuthor', 'Admin:updateAuthor');
$app->post('/admin/updateBlogData', 'Admin:updateBlogData');
$app->post('/admin/savePost', 'Posts:savePost');
$app->post('/admin/publishPost', 'Posts:publishPost');
$app->post('/admin/setPublished', 'Posts:setPublished');
$app->post('/admin/setUnpublished', 'Posts:setUnpublished');
$app->delete('/admin/posts/:id', 'Posts:deletePost');

$app->get('/details', 'Blog:details');

$app->get('/posts/:slug', 'Posts:getPost');
$app->get('/posts', 'Posts:getPosts');
$app->get('/posts/author/:id', 'Posts:getPostsByAuthor');

$app->get('/authors', 'Authors:getAuthors');
$app->get('/authors/:id', 'Authors:getAuthor');

// Run and clean up
$app->run();
R::close();

