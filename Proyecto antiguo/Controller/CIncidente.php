<?php
require_once '../Models/ConexionBase.php';
require_once '../Models/MIncidente.php';

use App\Models\MIncidente;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];
    $id_incidente = $_POST['id_incidente'] ?? null;
    $patente_bus = $_POST['patente_bus'];
    $descripcion_incidente = $_POST['descripcion_incidente'];
    $fecha_incidente = $_POST['fecha_incidente'];
    $gravedad_incidente = $_POST['gravedad_incidente'];

    // Convertir la gravedad a un número
    switch ($gravedad_incidente) {
        case 'leve':
            $gravedad_incidente = 1;
            break;
        case 'moderado':
            $gravedad_incidente = 2;
            break;
        case 'grave':
            $gravedad_incidente = 3;
            break;
        case 'muy grave':
            $gravedad_incidente = 4;
            break;
        default:
            $gravedad_incidente = 0;
            break;
    }

    // Asegúrate de que la fecha esté en el formato correcto
    $fecha_incidente = DateTime::createFromFormat('Y-m-d', $fecha_incidente)->format('Y-m-d');

    $incidente = new MIncidente($id_incidente, $patente_bus, $descripcion_incidente, $fecha_incidente, $gravedad_incidente);

    switch ($action) {
        case 'save':
            if ($incidente->save()) {
                echo "Incidente guardado exitosamente.";
            } else {
                echo "Error al guardar el incidente.";
            }
            break;
        case 'update':
            if ($incidente->update()) {
                echo "Incidente actualizado exitosamente.";
            } else {
                echo "Error al actualizar el incidente.";
            }
            break;
        case 'delete':
            if ($incidente->delete()) {
                echo "Incidente eliminado exitosamente.";
            } else {
                echo "Error al eliminar el incidente.";
            }
            break;
        default:
            echo "Acción no válida.";
            break;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id_incidente'])) {
    $id_incidente = $_GET['id_incidente'];
    $incidente = MIncidente::find($id_incidente);
    if ($incidente) {
        echo json_encode($incidente);
    } else {
        echo "Incidente no encontrado.";
    }
} else {

}
?>