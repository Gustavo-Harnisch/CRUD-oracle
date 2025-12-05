<?php 
namespace App\Controllers;

require(__DIR__ . '/../Models/MHorario.php');
require(__DIR__ . '/../View/VHorario.php');

use App\Models\MHorario;
use App\View\VHorario;

class Chorario {
    public function index(array $params) {
        try {
            // Obtener datos del arreglo
            $origen = $params['origen'] ?? null;
            $destino = $params['destino'] ?? null;
            $fecha_viaje = $params['fecha_viaje'] ?? null;

            // Validar datos
            if (is_null($origen) || is_null($destino) || is_null($fecha_viaje)) {
                throw new \Exception("Error: Todos los campos son obligatorios.");
            }

            // Obtener horarios desde el modelo
            $mHorario = new MHorario();
            $horarios = $mHorario->getIdHorario($origen, $destino, $fecha_viaje);

            // Renderizar la vista con los horarios
            $view = new VHorario();
            $view->render(['horarios' => $horarios]);
        } catch (\Exception $e) {
            echo $e->getMessage();    
        }
    }
}
?>