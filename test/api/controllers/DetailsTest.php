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

    public function testGetDetailsInvalid() {
        $response = $this->details->getDetails(new RequestMock(),
            new ResponseMock(), null);

        $this->assertEquals('failure', $response->status);
        $this->assertEquals('No blog details found.',
            $response->alerts[0]['text']);
    }

    public function testGetDetailsValid() {
        $details = R::dispense('detail');
        $details->name = 'Test Blog';
        $details->desc = 'A test blog.';
        $details->image = 'some url';
        R::store($details);

        $response = $this->details->getDetails(new RequestMock(),
            new ResponseMock(), null);

        $this->assertEquals('success', $response->status);
        $this->assertEquals('Test Blog', $response->data[0]['name']);
    }

}

