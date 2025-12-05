<?php

use App\Models\Conexion;

require_once __DIR__ . '/Conexion.php'; // Asegúrate de que la ruta es correcta

try {
    // Crear una instancia de la clase Conexion
    $conexion = new Conexion();
    $db = $conexion->connect(); // Establecer la conexión a Oracle

    if (isset($_GET['region_id'])) {
        $regionId = intval($_GET['region_id']); // Sanitizar entrada

        // Preparar la consulta
        $sql = "SELECT id_ciudad, nombre_ciudad FROM MFJCLPBC_CIUDAD WHERE id_region = :region_id";
        $stmt = oci_parse($db, $sql);

        if (!$stmt) {
            $e = oci_error($db);
            throw new Exception('Error al preparar la consulta: ' . $e['message']);
        }

        // Vincular el parámetro
        oci_bind_by_name($stmt, ':region_id', $regionId);

        // Ejecutar la consulta
        if (!oci_execute($stmt)) {
            $e = oci_error($stmt);
            throw new Exception('Error al ejecutar la consulta: ' . $e['message']);
        }

        // Crear un arreglo para almacenar las ciudades
        $ciudades = [];
        while ($row = oci_fetch_assoc($stmt)) {
            $ciudades[] = [
                'id' => $row['ID_CIUDAD'], // Asegúrate de que los nombres coinciden con tu base de datos
                'name' => $row['NOMBRE_CIUDAD']
            ];
        }

        // Liberar recursos
        oci_free_statement($stmt);

        // Devolver el JSON
        header('Content-Type: application/json');
        echo json_encode($ciudades);
        exit;
    } else {
        // Manejo de error si no se proporciona el ID de región
        http_response_code(400);
        echo json_encode(['error' => 'No region ID provided']);
        exit;
    }
} catch (Exception $e) {
    // Manejo de excepciones
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
