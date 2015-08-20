<?php

class JsonResponse {
    public $status;
    public $data;
    public $alerts;

    function __construct() {
        $this->status = 'failure';
        $this->data = [];
        $this->alerts =[];
    }

    function addData($object)  {
        $this->data[] = $object;
    }

    function addAlert($type, $text) {
        $this->alerts[] = [
            'type' => $type,
            'text' => $text
        ];
    }

    function asJson() {
        return json_encode($this);
    }
}
