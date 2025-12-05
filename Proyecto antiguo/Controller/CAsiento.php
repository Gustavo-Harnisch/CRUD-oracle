<?php 
namespace App\Controllers;

require(__DIR__ . '/../Models/MAsiento.php');
require(__DIR__ . '/../View/VAsientos.php');

use App\Models\MAsiento;
use App\View\VAsientos;

class CAsiento {
    public function index() {
        try {
            $model = new MAsiento();
            $asientos = $model->getAsientos('some_bus_patente'); // Replace 'some_bus_patente' with actual bus patente
            die(); // Agregar esta línea para detener la ejecución y ver el resultado
            $view = new VAsientos();
            $view->render(['asientos' => $asientos]);
        } catch (\Exception $e) {
            echo $e->getMessage();
        }
    }
}
?>