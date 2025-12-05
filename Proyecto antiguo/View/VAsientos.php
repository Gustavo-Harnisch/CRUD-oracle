<?php
require_once __DIR__ . '/../Models/MAsiento.php';

use App\Models\MAsiento;

if (isset($_GET['patente_bus']) && isset($_GET['id_horario'])) {
    $patente_bus = $_GET['patente_bus'];
    $id_horario = $_GET['id_horario'];

    // Obtener los asientos disponibles para la patente del bus
    $masiento = new MAsiento();
    $asientos = $masiento->getAsientos($patente_bus);
} else {
    echo "No se ha proporcionado la patente del bus, el ID del horario o el RUT del cliente.";
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selector de Asientos - C&C Turismo y Viajes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        h1 {
            margin-top: 20px;
            color: #333;
        }
        .bus-layout {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            width: 320px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border: 2px solid #00a8e1;
            border-radius: 10px;
        }
        .seat {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: #333;
            border-radius: 15px 15px 5px 5px;
            border: 2px solid #ccc;
            background-color: #e0e0e0;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .seat.occupied {
            background-color: #ff4d4d;
            cursor: not-allowed;
        }
        .legend {
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }
        .legend div {
            margin: 0 10px;
        }
        .available {
            width: 20px;
            height: 20px;
            background-color: #e0e0e0;
            display: inline-block;
            border: 2px solid #ccc;
        }
        .occupied-legend {
            width: 20px;
            height: 20px;
            background-color: #ff4d4d;
            display: inline-block;
            border: 2px solid #ccc;
        }
        .seat input[type="radio"] {
            display: none;
        }
        .seat label {
            display: block;
            width: 100%;
            height: 100%;
            line-height: 60px;
            text-align: center;
        }
        .seat input[type="radio"]:checked + label {
            background-color: #00a8e1;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Selector de Asientos</h1>
    <form action="confirmar_asiento.php" method="POST">
        <input type="hidden" name="id_horario" value="<?php echo htmlspecialchars($id_horario); ?>">
        <div class="bus-layout">
            <?php
            // Se espera que el controlador pase un arreglo de asientos a esta vista
            foreach ($asientos as $asiento) {
                $estado = $asiento['estado'] ?? null;
                $id_asiento = $asiento['id_asiento'] ?? null;
                $numero_asiento = $asiento['numero_asiento'] ?? null;

                if ($estado !== null && $id_asiento !== null && $numero_asiento !== null) {
                    $class = $estado == 1 ? 'seat occupied' : 'seat';
                    $disabled = $estado == 1 ? 'disabled' : '';
                    echo "<div class='$class'>
                            <input type='radio' name='id_asiento' id='asiento_$id_asiento' value='$id_asiento' $disabled>
                            <label for='asiento_$id_asiento'>$numero_asiento</label>
                          </div>";
                } else {
                    echo "<div class='seat'>N/A</div>";
                }
            }
            ?>
        </div>
        <div class="legend">
            <div><span class="available"></span> Disponible</div>
            <div><span class="occupied-legend"></span> Ocupado</div>
        </div>
        <button type="submit" class="submit-btn">Confirmar Asiento</button>
    </form>
</body>
</html>