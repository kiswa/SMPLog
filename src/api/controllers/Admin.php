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

        return $users;
    }
}

