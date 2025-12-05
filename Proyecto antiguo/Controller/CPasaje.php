<?php
namespace App\Controllers;
require(__DIR__ . '/../Models/MRuta.php');
require(__DIR__ . '/../View/VPasaje.php');

use App\Models\MRuta;
use App\View\VPasaje;

class CPasaje {
    /**
     * Muestra la página principal con las opciones de origen y destino
     */
    public function index() {
        try {
            // Obtener todos los datos de rutas
            // Obtener los orígenes y destinos desde el modelo
            $origenes = MRuta::getRutasByOrigen(); // Devuelve un array plano de valores únicos
            $destinos = MRuta::getRutasByDestino(); // Devuelve un array plano de valores únicos

            // Preparar datos para enviarlos a la vista
            $data = [
                'origenes' => $origenes,
                'destinos' => $destinos
            ];

            // Renderizar la vista
            $view = new VPasaje();
            $view->render($data);

        } catch (\Exception $e) {
            echo "Error: " . $e->getMessage();
        }
    }

    /**
     * Almacena los datos enviados desde el formulario
     */
    public function store() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Obtener datos del formulario
            $origen = $_POST['origen'] ?? null;
            $destino = $_POST['destino'] ?? null;
            $fecha_viaje = $_POST['fecha_viaje'] ?? null;

            // Validar datos
            if (!$origen || !$destino || !$fecha_viaje) {
                echo "Error: Todos los campos son obligatorios.";
                return;
            }

            // Validar que la fecha de viaje no sea pasada
            $fecha_actual = date('Y-m-d');
            if ($fecha_viaje < $fecha_actual) {
                echo "Error: La fecha de viaje no puede ser en el pasado.";
                return;
            }

            try {
                // Redirigir a indexHorario.php con los datos como parámetros en la URL
                $url = "asientos.p?origen=" . urlencode($origen) . "&destino=" . urlencode($destino) . "&fecha_viaje=" . urlencode($fecha_viaje);
                header("Location: $url");
                exit();
            } catch (\Exception $e) {
                echo "Error al procesar el formulario: " . $e->getMessage();
            }
        } else {
            echo "Método no permitido.";
        }
    }
}
?>