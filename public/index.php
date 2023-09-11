<?php

define('SHOW_ERRORS', true);
define('APP_PATH', dirname( __DIR__));
define("APP_URL", "http://{$_SERVER['HTTP_HOST']}");

require APP_PATH . '/vendor/autoload.php';
require APP_PATH . '/config/routes.php';

$app = new \Engine\App();