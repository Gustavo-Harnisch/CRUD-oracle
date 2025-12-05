<?php
require_once __DIR__ . '/../Models/MHorario.php';
use App\Models\MHorario;

session_start();
if (!isset($_SESSION['cliente']) && !isset($_SESSION['admin'])) {
    header("Location: Login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['id_horario'])) {
        $id_horario = $_POST['id_horario'];

        // Obtener la patente del bus asociada al horario seleccionado
        $horario = MHorario::getHorarioById($id_horario);
        if ($horario) {
            $patente_bus = $horario['PATENTE_BUS'];
            header("Location: VAsientos.php?patente_bus=" . urlencode($patente_bus));
            exit;
        } else {
            echo "Horario no encontrado.";
        }
    } else {
        echo "No se ha seleccionado ningún horario.";
    }
} else {
    echo "Método no permitido.";
}
?>