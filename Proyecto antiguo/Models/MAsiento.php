<?php
namespace App\Models;

use Exception;

require_once __DIR__ . '/ConexionBase.php';

class MAsiento {
    private $id_asiento;
    private $patente_bus;
    private $numero_asiento;
    private $estado;
    private $db;

    public function __construct($id_asiento = null, $patente_bus = null, $numero_asiento = null, $estado = null) {
        $this->id_asiento = $id_asiento;
        $this->patente_bus = $patente_bus;
        $this->numero_asiento = $numero_asiento;
        $this->estado = $estado;
    }

    public function getAsientos(string $patenteBus) {
        try {
            $conexion = new ConexionBase();
            $db = $conexion->connect();

            // Configurar codificación UTF-8
            putenv('NLS_LANG=AMERICAN_AMERICA.AL32UTF8');

            $sql = "BEGIN Consultar_id_asiento(:patente_bus, :cur_asiento); END;";
            $stmt = oci_parse($db, $sql);

            $cursor = oci_new_cursor($db);
            oci_bind_by_name($stmt, ':patente_bus', $patenteBus);
            oci_bind_by_name($stmt, ':cur_asiento', $cursor, -1, OCI_B_CURSOR);

            oci_execute($stmt); // Ejecuta el procedimiento
            oci_execute($cursor); // Ejecuta el cursor

            $asientos = [];
            while (($row = oci_fetch_assoc($cursor)) !== false) {
                $asientos[] = [
                    'id_asiento' => $row['ID_ASIENTO'],
                    'numero_asiento' => $row['NUMERO_ASIENTO'],
                    'estado' => $row['ESTADO']
                ];
            }

            oci_free_statement($stmt);
            oci_free_statement($cursor);
            oci_close($db);

            return $asientos;
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return [];
        }
    }

    public static function getAsientoById($id_asiento) {
        try {
            $conexion = new ConexionBase();
            $db = $conexion->connect();

            $sql = "SELECT ESTADO, NUMERO_ASIENTO, ID_ASIENTO, PATENTE_BUS FROM MFJCLPBC_ASIENTO WHERE ID_ASIENTO = :id_asiento";
            $stmt = oci_parse($db, $sql);
            oci_bind_by_name($stmt, ':id_asiento', $id_asiento);
            oci_execute($stmt);

            $asiento = oci_fetch_assoc($stmt);

            oci_free_statement($stmt);
            oci_close($db);

            return $asiento;
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return null;
        }
    }
}
?>