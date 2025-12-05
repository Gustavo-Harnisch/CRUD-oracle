<?php
require_once __DIR__ . '/../Models/ConexionBase.php';

$origen = $_GET['origen'];
$destino = $_GET['destino'];
$fecha = $_GET['fecha'];

$conexion = new \App\Models\ConexionBase();
$conn = $conexion->connect();

$horarios = [];

if ($conn) {
    $query = "SELECT H.ID_HORARIO, H.PATENTE_BUS, TO_CHAR(H.ID_HORARIO, 'YYYY-MM-DD HH24:MI:SS') AS FECHA_HORA
              FROM MFJCLPBC_HORARIO_BUS_RUTA H
              JOIN MFJCLPBC_RUTA R ON H.ID_RUTA = R.ID_RUTA
              WHERE R.ORIGEN_RUTA = :origen AND R.DESTINO_RUTA = :destino AND TO_CHAR(H.ID_HORARIO, 'YYYY-MM-DD') = :fecha";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':origen', $origen);
    $stmt->bindParam(':destino', $destino);
    $stmt->bindParam(':fecha', $fecha);
    $stmt->execute();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $horarios[] = $row;
    }
} else {
    echo "No se pudo establecer la conexión";
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
    <title>Horarios Disponibles</title>
    <style>
        /* Estilos generales */
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f7f7f7;
        }

        /* Tabla de horarios */
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
    <h1>Horarios Disponibles</h1>
    <form action="seleccionar_asiento.php" method="POST">
        <table>
            <thead>
                <tr>
                    <th>Fecha y Hora</th>
                    <th>Patente Bus</th>
                    <th>Seleccionar</th>
                </tr>
            </thead>
            <tbody>
                <?php if (count($horarios) > 0): ?>
                    <?php foreach ($horarios as $horario): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($horario['FECHA_HORA']); ?></td>
                            <td><?php echo htmlspecialchars($horario['PATENTE_BUS']); ?></td>
                            <td>
                                <input type="radio" name="horario" value="<?php echo htmlspecialchars($horario['ID_HORARIO']); ?>" required>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="3">No se encontraron horarios disponibles para la ruta seleccionada.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
        <button type="submit">Confirmar</button>
    </form>
</body>
</html>