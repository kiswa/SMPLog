<?php
require_once __DIR__ . '/../Mocks.php';

use RedBeanPHP\R;
use Firebase\JWT\JWT;

class DetailsTest extends PHPUnit_Framework_TestCase {
    private $details;

    public static function setupBeforeClass() {
        try {
            R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    public function setUp() {
        R::nuke();

        $this->details = new Details(new ContainerMock());
    }

    public function testGetDetailsDefault() {
        $response = $this->details->getDetails(new RequestMock(),
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('SMPLog', $response->data[0]['name']);
    }

    public function testGetDetailsCustom() {
        $details = R::dispense('detail');
        $details->desc = 'A test blog.';
        $details->image = 'some url';
        R::store($details);

        $response = $this->details->getDetails(new RequestMock(),
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('SMPLog', $response->data[0]['name']);
        $this->assertEquals('A test blog.', $response->data[0]['desc']);
    }

}

