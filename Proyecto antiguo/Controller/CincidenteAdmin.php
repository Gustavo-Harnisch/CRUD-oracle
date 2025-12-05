<?php
require(__DIR__ . '/../Models/MincidenteAdmin.php');
require(__DIR__ . '/../View/VincidenteAdmin.php');

use App\Models\MincidenteAdmin;
use App\View\VincidenteAdmin;

class CincidenteAdmin {
    public function index() {
        try {
            $model = new MincidenteAdmin();
            $datos = [
                'incidentes' => $model->getIncidentes(),
            ];

            $view = new VincidenteAdmin();
            $view->render($datos);
            
        } catch (\Exception $e) {
            echo $e->getMessage();
        }
    }
}
?>