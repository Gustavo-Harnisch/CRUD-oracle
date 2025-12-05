<?php

require_once __DIR__ . '/../Controller/CMantenimiento.php';

use App\Controllers\CMantenimiento;

$controller = new CMantenimiento();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller->store();
} else {
    $controller->index();
}