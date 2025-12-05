<?php
require_once __DIR__ . '/../Models/MAsiento.php';
use App\Models\MAsiento;

if (isset($_GET['patente_bus']) && isset($_GET['id_horario'])) {
    $patente_bus = $_GET['patente_bus'];
    $id_horario = $_GET['id_horario'];

    $asientoModel = new MAsiento();
    $asientos = $asientoModel->getAsientos($patente_bus);
} else {
    echo "Faltan parámetros.";
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Talca París y Londres: Conectando destinos con comodidad y confianza. Compra tus pasajes y descubre más sobre nuestros servicios.">
    <meta name="keywords" content="buses, transporte, pasajes, Talca, viajes, servicios">
    <meta name="author" content="">
    <title>Seleccionar Asiento</title>
    <style>
        /* Estilos generales */
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f7f7f7;
        }

        /* Tabla de asientos */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        table, th, td {
            border: 1px solid #ddd;
        }

        th, td {
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <h1>Seleccionar Asiento</h1>
    <form action="confirmar_asiento.php" method="POST">
        <input type="hidden" name="horario" value="<?php echo htmlspecialchars($id_horario); ?>">
        <input type="hidden" name="patente_bus" value="<?php echo htmlspecialchars($patente_bus); ?>">
        <table>
            <thead>
                <tr>
                    <th>Número de Asiento</th>
                    <th>Estado</th>
                    <th>Seleccionar</th>
                </tr>
            </thead>
            <tbody>
                <?php if (count($asientos) > 0): ?>
                    <?php foreach ($asientos as $asiento): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($asiento['numero_asiento']); ?></td>
                            <td><?php echo $asiento['estado'] == 1 ? 'Ocupado' : 'Disponible'; ?></td>
                            <td>
                                <?php if ($asiento['estado'] == 0): ?>
                                    <input type="radio" name="asiento" value="<?php echo htmlspecialchars($asiento['id_asiento']); ?>" required>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="3">No se encontraron asientos disponibles.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
        <button type="submit">Confirmar Asiento</button>
    </form>
</body>
</html>