<?php
namespace App\Controllers;

require_once __DIR__ . '/../Models/ConexionBase.php';
require_once __DIR__ . '/../Models/Mmantenimiento.php';
require_once __DIR__ . '/../View/VMantenimiento.php';

use App\Models\Mmantenimiento;
use App\Models\ConexionBase;
use App\View\VMantenimiento;
use PDO;
use PDOException;

class CMantenimiento {
    public function index() {
        $conexion = new ConexionBase();
        $db = $conexion->connect();

        $stmt = $db->prepare("SELECT m.ID_MANTENIMIENTO, TO_CHAR(m.FECHA_MANTENIMIENTO, 'DD/MM/YYYY') AS FECHA_MANTENIMIENTO, m.PATENTE_BUS, d.DESCRIPCION_MANTENIMIENTO 
                              FROM MFJCLPBC_mantenimiento m 
                              JOIN MFJCLPBC_detalle_mantenimiento d ON m.ID_MANTENIMIENTO = d.ID_MANTENIMIENTO");
        $stmt->execute();
        $mantenimientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $fecha_sistema = date('d/m/Y');

        $view = new VMantenimiento();
        $view->render(['mantenimientos' => $mantenimientos, 'fecha_sistema' => $fecha_sistema]);
    }

    public function store() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $patente_bus = $_POST['patente_bus'];
            $descripcion_mantenimiento = $_POST['descripcion_mantenimiento'];

            try {
                $conexion = new ConexionBase();
                $db = $conexion->connect();

                // Generar ID de mantenimiento automáticamente
                $stmt = $db->prepare("SELECT MAX(ID_MANTENIMIENTO) AS max_id FROM MFJCLPBC_mantenimiento");
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $max_id = $result['max_id'] ?? 0; // Si no hay resultados, inicializa a 0
                $new_id = $max_id + 1;

                // Insertar en MFJCLPBC_MANTENIMIENTO
                $stmt = $db->prepare("INSERT INTO MFJCLPBC_mantenimiento (ID_MANTENIMIENTO, FECHA_MANTENIMIENTO, PATENTE_BUS) VALUES (:id, SYSDATE, :patente)");
                $stmt->bindParam(':id', $new_id);
                $stmt->bindParam(':patente', $patente_bus);
                $stmt->execute();

                // Insertar en MFJCLPBC_DETALLE_MANTENIMIENTO
                $stmt = $db->prepare("INSERT INTO MFJCLPBC_detalle_mantenimiento (ID_DETALLE, ID_MANTENIMIENTO, DESCRIPCION_MANTENIMIENTO) VALUES (:id_detalle, :id_mantenimiento, :descripcion)");
                $stmt->bindParam(':id_detalle', $new_id); // Usar el mismo ID para el detalle
                $stmt->bindParam(':id_mantenimiento', $new_id);
                $stmt->bindParam(':descripcion', $descripcion_mantenimiento);
                $stmt->execute();

                header('Location: ../View/indexmantenimiento.php');
                exit();
            } catch (PDOException $e) {
                echo "Error: " . $e->getMessage();
                die();
            }
        }
    }
}

$controller = new CMantenimiento();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller->store();
} else {
    $controller->index();
}