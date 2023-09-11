<?php

use Engine\Router;

Router::add('^$', ['controller' => 'product', 'action' => 'index']);
Router::add('^(?P<controller>[a-zA-z]+)\/?(?P<action>[a-zA-z]+)?\/?(?P<id>[0-9]+)?$');
