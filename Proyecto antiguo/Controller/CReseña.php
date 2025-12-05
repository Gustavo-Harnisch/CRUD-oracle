<?php
require(__DIR__ . '/../Models/MReseña.php');
require(__DIR__ . '/../View/VReseña.php');

use App\Models\MReseña;
use App\View\VReseña;

class CReseña {

    // Renderizar la vista
    public function index() {
        try {
            $view = new VReseña();
            $view->render();
        } catch (Exception $e) {
            echo "Error al renderizar la vista: " . $e->getMessage();
        }
    }

    // Crear reseña
    public function create() {
        try {
            $rut_cliente = $_POST['rut_cliente'] ?? null;
            $detalle_resena = $_POST['detalle_reseña_cliente'] ?? null;
    
            if (!$rut_cliente || !$detalle_resena) {
                throw new Exception("Faltan datos para crear la reseña.");
            }
    
            $model = new MReseña();
            $resultado = $model->createResena($rut_cliente, $detalle_resena);
    
        } catch (Exception $e) {
            echo "Error en create: " . $e->getMessage();
        }
    }
    
}
?>
