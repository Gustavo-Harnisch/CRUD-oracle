<?php
session_start();
$horarios = $_SESSION['horarios'] ?? [];

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
        <ul>
            <?php foreach ($horarios as $horario): ?>
                <li>ID Horario: <?= htmlspecialchars($horario['ID_HORARIO']) ?></li>
            <?php endforeach; ?>
        </ul>
    <?php else: ?>
        <p>No hay horarios disponibles para esta ruta y fecha.</p>
    <?php endif; ?>
</body>
</html>