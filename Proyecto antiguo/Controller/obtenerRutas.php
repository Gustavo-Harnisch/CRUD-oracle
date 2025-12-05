<?php
require_once __DIR__ . '/../Models/ConexionBase.php';

use App\Models\ConexionBase;

try {
    $conexion = new ConexionBase();
    $db = $conexion->connect();
    $stmt = $db->prepare("SELECT ORIGEN_RUTA, DESTINO_RUTA FROM MFJCLPBC_RUTA");
    $stmt->execute();
    $rutas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['rutas' => $rutas]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>