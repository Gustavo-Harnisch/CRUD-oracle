<?php
require('../Controller/CReseña.php');

// Habilitar errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Crear instancia del controlador
    $controller = new CReseña();

    // Manejar el envío del formulario
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->create();
    }

    // Renderizar la vista
    $controller->index();
} catch (Exception $e) {
    // Mostrar mensaje de error si ocurre algún problema
    echo "Error: " . $e->getMessage();
}
?>
