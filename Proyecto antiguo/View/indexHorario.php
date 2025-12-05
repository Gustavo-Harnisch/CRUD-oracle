<?php
session_start();
require_once __DIR__ . '/../Models/MHorario.php';
use App\Models\MHorario;

$origen = $_GET['origen'];
$destino = $_GET['destino'];
$fecha_viaje = $_GET['fecha_viaje'];

$horarioModel = new MHorario();
$horarios = $horarioModel->getHorariosDisponibles($origen, $destino, $fecha_viaje);

$_SESSION['horarios'] = $horarios;
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Horarios Disponibles</title>
</head>
<body>
    <h1>Horarios Disponibles</h1>
    <?php if (!empty($horarios)): ?>
        <form action="procesarSeleccion.php" method="POST">
            <ul>
                <?php foreach ($horarios as $horario): ?>
                    <li>
                        <input type="radio" name="id_horario" value="<?= htmlspecialchars($horario['ID_HORARIO']) ?>" required>
                        ID Horario: <?= htmlspecialchars($horario['ID_HORARIO']) ?>
                    </li>
                <?php endforeach; ?>
            </ul>
            <button type="submit">Seleccionar Horario</button>
        </form>
    <?php else: ?>
        <p>No hay horarios disponibles para esta ruta y fecha.</p>
    <?php endif; ?>
</body>
</html>
