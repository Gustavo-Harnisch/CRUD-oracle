<?php
require_once __DIR__ . '/../Models/MAsiento.php';
use App\Models\MAsiento;

session_start();
if (!isset($_SESSION['cliente']) && !isset($_SESSION['admin'])) {
    header("Location: Login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['horario']) && isset($_POST['asiento']) && isset($_POST['patente_bus'])) {
        $id_horario = $_POST['horario'];
        $id_asiento = $_POST['asiento'];
        $patente_bus = $_POST['patente_bus'];

        // Aquí puedes procesar la confirmación del asiento seleccionado
        // Por ejemplo, guardar la selección en la base de datos o mostrar un mensaje de confirmación
        echo "Horario seleccionado: " . htmlspecialchars($id_horario) . "<br>";
        echo "Asiento seleccionado: " . htmlspecialchars($id_asiento) . "<br>";
        echo "Patente del bus: " . htmlspecialchars($patente_bus);
    } else {
        echo "No se ha seleccionado ningún horario, asiento o patente del bus.";
    }
} else {
    echo "Método no permitido.";
}
?>