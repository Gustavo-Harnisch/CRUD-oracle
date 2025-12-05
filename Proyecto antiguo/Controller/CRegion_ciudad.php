<?php
header('Content-Type: application/json; charset=UTF-8');

// Inicia el buffer de salida para evitar caracteres no deseados
ob_start();

require_once __DIR__ . '/../Models/ConexionBase.php'; // Ajusta la ruta según tu proyecto

use App\Models\ConexionBase;

$database = new ConexionBase();
$conn = $database->connect();

if (!$conn) {
    echo json_encode(['error' => 'No se pudo conectar a la base de datos']);
    ob_end_flush();
    exit;
}

try {
    // Obtener regiones
    $regions = $conn->query("SELECT id_region AS id, nombre_region AS nombre FROM MFJCLPBC_region")->fetchAll(PDO::FETCH_ASSOC);

    // Obtener ciudades con sus regiones
    $cities = $conn->query("
        SELECT c.id_ciudad AS id, c.nombre_ciudad AS nombre, drc.id_region AS region_id
        FROM MFJCLPBC_ciudad c
        JOIN MFJCLPBC_detalle_region_ciudad drc ON c.id_ciudad = drc.id_ciudad
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Obtener comunas con sus ciudades
    $communes = $conn->query("
        SELECT co.id_comuna AS id, co.nombre_comuna AS nombre, dcc.id_ciudad AS city_id
        FROM MFJCLPBC_comuna co
        JOIN MFJCLPBC_detalle_ciudad_comuna dcc ON co.id_comuna = dcc.id_comuna
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Enviar datos como JSON
    echo json_encode([
        'regions' => $regions,
        'cities' => $cities,
        'communes' => $communes,
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    // Registro en logs de error
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['error' => 'Database error.']);
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    echo json_encode(['error' => 'General error.']);
}

// Limpia el buffer de salida
ob_end_flush();
$conn = null;
?>