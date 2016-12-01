<?php
require './vendor/autoload.php';

use RedBeanPHP\R;
R::setup('sqlite:smplog.db');

$app = new Slim\App();
require 'app-setup.php';

Auth::CreateInitialAdmin($container);
Auth::CreateJwtKey();

$app->post  ('/admin/login',                'Auth:login');
$app->post  ('/admin/logout',               'Auth:logout');
$app->post  ('/admin/authenticate',         'Auth:authenticate');

$app->get   ('/admin/authors',              'Admin:getAuthors');
$app->post  ('/admin/authors',              'Admin:addAuthor');

$app->get   ('/admin/authors/{id}',         'Admin:getAuthor');
$app->post  ('/admin/authors/{id}',         'Admin:updateAuthor');
$app->delete('/admin/authors/{id}',         'Admin:removeAuthor');

$app->post  ('/admin/details',              'Admin:updateDetails');

$app->get   ('/admin/posts',                'Admin:getPosts'); // (by requesting author/user)
$app->post  ('/admin/posts',                'Admin:addPost');  // (needs to handle publish case)

$app->post  ('/admin/posts/{id}',           'Admin:updatePost');
$app->delete('/admin/posts/{id}',           'Admin:removePost');
$app->post  ('/admin/posts/{id}/publish',   'Admin:publishPost');
$app->post  ('/admin/posts/{id}/unpublish', 'Admin:unpublishPost');

$app->get   ('/details',                    'Details:getDetails');

$app->get   ('/posts',                      'Posts:getPosts');
$app->get   ('/posts/:slug',                'Posts:getPost');

$app->get   ('/authors',                    'Authors:getAuthors');
$app->get   ('/authors/{id}',               'Authors:getAuthor');
$app->get   ('/authors/{id}/posts',         'Authors:getPosts');

$app->run();
R::close();

