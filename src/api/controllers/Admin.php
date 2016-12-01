<?php
use RedBeanPHP\R;

class Admin extends BaseController {

    public function getAuthors($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);
        $data = $this->getAuthorsCleaned($user->is_admin);

        $this->apiJson->setSuccess();
        $this->apiJson->addData($data);

        return $this->jsonResponse($response);
    }

    public function addAuthor($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);

        if (!$user->is_admin) {
            $this->apiJson->addAlert('error',
                'Only admin users may add a new user.');

            return $this->jsonResponse($response, 403);
        }

        $data = json_decode($request->getBody());
        $newAuthor = $this->userFromData($data);

        if ($this->usernameInUse($newAuthor->username)) {
            return $this->jsonResponse($response);
        }

        $newAuthor->password_hash =
            password_hash($data->password, PASSWORD_BCRYPT);

        R::store($newAuthor);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'New user ' . $newAuthor->username . ' added.');
        $this->apiJson->addData($this->getAuthorsCleaned(true));

        return $this->jsonResponse($response);
    }

    public function getAuthor($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);
        $author = $this->loadAuthor($args['id']);

        if (!$author) {
            return $this->jsonResponse($response);
        }

        if ($author->is_admin && !$user->is_admin) {
            $this->apiJson->addAlert('error',
                'You must be an admin to request that user.');
            return $this->jsonResponse($response);
        }

        unset($author->password_hash);
        unset($author->active_token);

        $this->apiJson->setSuccess();
        $this->apiJson->addData($author->export());

        return $this->jsonResponse($response);
    }

    public function updateAuthor($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);
        $author = $this->loadAuthor($args['id']);

        if (!$author) {
            return $this->jsonResponse($response);
        }

        // Non-admins may only change their own user
        if (!$user->is_admin && ($user->id !== $author->id)) {
            $this->apiJson->addAlert('error',
                'You must be an admin to update that user.');

            return $this->jsonResponse($response);
        }

        $data = json_decode($request->getBody());
        $update = R::dispense('user');
        $this->loadUserData($update, $data);

        if ($update->username !== $author->username) {
            if ($this->usernameInUse($update->username)) {
                return $this->jsonResponse($response);
            }
        }

        $this->loadUserData($author, $data);

        if (isset($data->password)) {
            $author->password_hash =
                password_hash($data->password, PASSWORD_BCRYPT);
        }

        R::store($author);
        unset($author->password_hash);
        unset($author->active_token);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'User ' . $author->username . ' updated.');
        $this->apiJson->addData($author->export());

        return $this->jsonResponse($response);
    }

    public function removeAuthor($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);

        if (!$user->is_admin) {
            $this->apiJson->addAlert('error',
                'Only admin users may remove a user.');

            return $this->jsonResponse($response, 403);
        }

        $author = R::load('user', $args['id']);
        $username = $author->username;
        R::trash($author);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'User ' . $username . ' removed.');

        return $this->jsonResponse($response);
    }

    public function updateDetails($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);

        if (!$user->is_admin) {
            $this->apiJson->addAlert('error',
                'Only admin users may update blog details.');

            return $this->jsonResponse($response, 403);
        }

        $data = json_decode($request->getBody());
        $details = R::load('detail', 1);

        $details->name = $data->name;
        $details->image = $data->image;
        $details->description = $data->description;

        R::store($details);

        // TODO: Update RSS feed

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Blog details updated.');
        $this->apiJson->addData($details->export());

        return $this->jsonResponse($response);
    }

    public function getPosts($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);
        $posts = [];

        if ($user->is_admin) {
            $posts = R::findAll('post');
        } else {
            $posts = R::findAll('post', 'user_id = ?', [ $user->id ]);
        }

        foreach($posts as $key => $post) {
            $posts[$key] = $post->exportAll();
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($posts);

        return $this->jsonResponse($response);
    }

    public function addPost($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);
        $data = json_decode($request->getBody());
        $post = R::dispense('post');

        $post->title = $data->title;
        $post->text = $data->text;
        $post->slug = $this->createUniqueSlug($data->title);
        $post->is_published = $data->publish;

        if ($post->is_published) {
            $post->publish_date = time();
        }

        $user->ownPostList[] = $post;
        R::store($user);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Post ' . $post->title . ' saved.');

        return $this->jsonResponse($response);
    }

    public function updatePost($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);
        $data = json_decode($request->getBody());
        $post = $this->loadPost($args['id']);

        if (!$post) {
            return $this->jsonResponse($response, 400);
        }

        if ($post->user_id !== $user->id && !$user->is_admin) {
            $this->apiJson->addAlert('error', 'You cannot edit this post.');
            return $this->jsonResponse($response, 403);
        }

        $post->title = $data->title;
        $post->text = $data->text;
        $post->is_published = $data->publish;
        R::store($post);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Post ' . $post->title . ' updated.');
        $this->apiJson->addData($post->export());

        return $this->jsonResponse($response);
    }

    public function removePost($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);
        $post = $this->loadPost($args['id']);

        if (!$post) {
            return $this->jsonResponse($response, 400);
        }

        if ($post->user_id !== $user->id && !$user->is_admin) {
            $this->apiJson->addAlert('error', 'You cannot remove this post.');
            return $this->jsonResponse($response, 403);
        }

        $title = $post->title;
        R::trash($post);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Post ' . $title . ' removed.');

        return $this->jsonResponse($response);
    }

    public function publishPost($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);
        $post = $this->loadPost($args['id']);

        if (!$post) {
            return $this->jsonResponse($response, 400);
        }

        if ($post->user_id !== $user->id && !$user->is_admin) {
            $this->apiJson->addAlert('error', 'You cannot publish this post.');
            return $this->jsonResponse($response, 403);
        }

        $post->is_published = true;
        $post->publish_date = time();
        R::store($post);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Post ' . $post->title . ' published.');

        return $this->jsonResponse($response);
    }

    public function unpublishPost($request, $response, $args) {
        $status = $this->secureRoute($request, $response);
        if ($status !== 200) {
            return $this->jsonResponse($response, $status);
        }

        $user = Auth::GetUser($request);
        $post = $this->loadPost($args['id']);

        if (!$post) {
            return $this->jsonResponse($response, 400);
        }

        if ($post->user_id !== $user->id && !$user->is_admin) {
            $this->apiJson->addAlert('error', 'You cannot unpublish this post.');
            return $this->jsonResponse($response, 403);
        }

        $post->is_published = false;
        $post->publish_date = null;
        R::store($post);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Post ' . $post->title . ' unpublished.');

        return $this->jsonResponse($response);
    }

    private function createUniqueSlug($string) {
        $slug = $this->createSlug($string);

        $check = R::find('post', 'slug LIKE ?', [ $slug . '%' ]);

        if (count($check)) {
            $slug = $slug . '-' . (count($check) + 1);
        }

        return $slug;
    }

    private function createSlug($string) {
        // @codeCoverageIgnoreStart
        if ($string !== mb_convert_encoding(
                mb_convert_encoding($string, 'UTF-32', 'UTF-8'),
                'UTF-8', 'UTF-32')) {
            $string = mb_convert_encoding($string, 'UTF-8',
                mb_detect_encoding($string));
        } // @codeCoverageIgnoreEnd

        $string = htmlentities($string, ENT_NOQUOTES, 'UTF-8');
        $string = preg_replace('`&([a-z]{1,2})(acute|uml|circ|grave|ring|' .
            'cedil|slash|tilde|caron|lig);`i', '\\1', $string);
        $string = html_entity_decode($string, ENT_NOQUOTES, 'UTF-8');
        $string = preg_replace(array('`[^a-z0-9]`i','`[-]+`'), '-', $string);
        $string = strtolower(trim($string, '-'));

        return $string;
    }

    private function loadUserData(&$user, $data) {
        $user->username = $data->username;
        $user->is_admin = $data->is_admin;
        $user->is_active = $data->is_active;
        $user->name = $data->name;
        $user->image = $data->image;
        $user->logins = $data->logins;
        $user->last_login = $data->last_login;
    }

    private function userFromData($data) {
        $user = R::dispense('user');

        $this->loadUserData($user, $data);

        // Set default values for new user
        $user->is_admin = false;
        $user->is_active = true;
        $user->logins = 0;
        $user->last_login = null;
        $user->active_token = null;

        return $user;
    }

    private function usernameInUse($username) {
        $existing = R::findOne('user', 'username = ?', [$username]);

        if ($existing) {
            $this->apiJson->addAlert('error', 'Username already exists. ' .
                'Change the username and try again.');
            return true;
        }

        return false;
    }

    private function loadAuthor($id) {
        $author = R::load('user', $id);

        if (!$author->id) {
            $this->apiJson->addAlert('error',
                'No author found for id ' . $id . '.');

            return null;
        }

        return $author;
    }

    private function loadPost($id) {
        $post = R::load('post', $id);

        if (!$post->id) {
            $this->apiJson->addAlert('error',
                'No post found for id ' . $id . '.');

            return null;
        }

        return $post;
    }

    private function getAuthorsCleaned($isAdmin) {
        $users = R::findAll('user');

        $toRemove = [];

        foreach($users as $user) {
            unset($user->password_hash);
            unset($user->active_token);

            if (!$isAdmin) {
                $toRemove[] = $user;
            }
        }

        $users = array_diff($users, $toRemove);

        foreach($users as $key => $user) {
            $users[$key] = $user->export();
        }

        return $users;
    }

}

