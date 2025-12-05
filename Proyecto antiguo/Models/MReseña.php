<?php
namespace App\Models;

use Exception;
use PDO;

require_once __DIR__ . '/Conexion.php';

class MReseña {
    private $db;

    public function __construct() {
        $conexion = new Conexion();
        $this->db = $conexion->connect();
    }

    // Método para Crear (C)
    public function createResena($rut_cliente, $detalle_resena_cliente): bool {
        try {
            putenv('NLS_LANG=AMERICAN_AMERICA.AL32UTF8');

            $sql = "BEGIN CREATE_RESENA(:rut_cliente, :detalle_resena); END;";
            $stmt = oci_parse($this->db, $sql);
        
            oci_bind_by_name($stmt, ':rut_cliente', $rut_cliente);
            oci_bind_by_name($stmt, ':detalle_resena', $detalle_resena_cliente);
        
            if (!oci_execute($stmt)) {
                $e = oci_error($stmt);
                throw new Exception($e['message']);
            }
        
            oci_free_statement($stmt);
            return true;
        } catch (Exception $e) {
            echo "Error en createResena: " . $e->getMessage();
            return false;
        }
    }
    
}    