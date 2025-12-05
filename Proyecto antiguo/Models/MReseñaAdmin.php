<?php
namespace App\Models;

use Exception;

require_once __DIR__ . '/Conexion.php';

class MReseñaAdmin {
    private $db;

    public function __construct() {
        $conexion = new Conexion();
        $this->db = $conexion->connect();
    }

    public function getResenas(): array {
        try {
            putenv('NLS_LANG=AMERICAN_AMERICA.AL32UTF8'); // Configuración de idioma para Oracle

            $sql = "BEGIN Consultar_Resenas(:cur_resenas); END;";
            $stmt = oci_parse($this->db, $sql);

            $cursor = oci_new_cursor($this->db);
            oci_bind_by_name($stmt, ':cur_resenas', $cursor, -1, OCI_B_CURSOR);

            oci_execute($stmt); // Ejecuta el procedimiento
            oci_execute($cursor); // Ejecuta el cursor

            $resenas = [];
            while (($row = oci_fetch_assoc($cursor)) !== false) {
                $resenas[] = [
                    'fecha_resena_cliente' => $row['FECHA_RESENA_CLIENTE'] ?? 'Fecha no disponible',
                    'rut_cliente' => $row['RUT_CLIENTE'] ?? 'RUT no disponible',
                    'detalle_resena_cliente' => $row['DETALLE_RESENA_CLIENTE'] ?? 'Sin reseña',
                ];
            }

            oci_free_statement($stmt);
            oci_free_statement($cursor);

            return $resenas;
        } catch (Exception $e) {
            error_log('Error en getResenas: ' . $e->getMessage());
            return [];
        }
    }
}
