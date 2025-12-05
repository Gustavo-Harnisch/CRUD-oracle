<?php
require_once '../Models/ConexionBase.php';

use App\Models\ConexionBase;

function getCiudades($id_region) {
    $conexion = new ConexionBase();
    $db = $conexion->connect();

    $query = "SELECT C.ID_CIUDAD, C.NOMBRE_CIUDAD 
              FROM MFJCLPBC_CIUDAD C
              JOIN MFJCLPBC_DETALLE_REGION_CIUDAD DRC ON C.ID_CIUDAD = DRC.ID_CIUDAD
              WHERE DRC.ID_REGION = :id_region";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id_region', $id_region);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

if (isset($_GET['id_region'])) {
    $id_region = $_GET['id_region'];
    $ciudades = getCiudades($id_region);
    echo json_encode(['cities' => $ciudades]);
} else {
    echo json_encode(['error' => 'Faltan parámetros']);
}
?>