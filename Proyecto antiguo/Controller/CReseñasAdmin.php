<?php
require(__DIR__ . '/../Models/MReseñaAdmin.php');
require(__DIR__ . '/../View/VReseñaAdmin.php');

use App\Models\MReseñaAdmin;
use App\View\VReseñaAdmin;

class CReseñasAdmin {
    public function index() {
        try {
            $model = new MReseñaAdmin();
            $datos = ['reseñas' => $model->getResenas()];

            $view = new VReseñaAdmin();
            $view->render($datos);
        } catch (Exception $e) {
            echo 'Error: ' . $e->getMessage();
        }
    }
}
