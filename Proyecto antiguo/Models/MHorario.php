<?php

namespace App\Models;

use Exception;

require_once __DIR__ . '/Conexion.php';

class MHorario {
    private $db;

    public function __construct() {
        $conexion = new Conexion();
        $this->db = $conexion->connect();
    }

    public function getIdRuta(string $origen, string $destino): array {
        try {
            putenv('NLS_LANG=AMERICAN_AMERICA.AL32UTF8');

            // Procedimiento almacenado
            $sql = "BEGIN Consultar_Id_Ruta(:p_origen, :p_destino, :cur_ruta); END;";
            $stmt = oci_parse($this->db, $sql);

            // Vincular parámetros
            oci_bind_by_name($stmt, ':p_origen', $origen);
            oci_bind_by_name($stmt, ':p_destino', $destino);
            $cursor = oci_new_cursor($this->db);
            oci_bind_by_name($stmt, ':cur_ruta', $cursor, -1, OCI_B_CURSOR);

            // Ejecutar el procedimiento
            oci_execute($stmt);
            oci_execute($stmt);
            oci_execute($cursor);

            // Procesar el cursor
            $rutas = [];
            while (($row = oci_fetch_assoc($cursor)) !== false) {
                $rutas[] = htmlspecialchars(mb_convert_encoding($row['ID_RUTA'], 'UTF-8', 'ISO-8859-1'));
            }

            // Liberar recursos
            oci_free_statement($stmt);
            oci_free_statement($cursor);

            return $rutas;
        } catch (Exception $e) {
            echo 'Error: ' . $e->getMessage();
            return [];
        }
    }

    public static function getHorarioById($id_horario) {
        try {
            $conexion = new Conexion();
            $db = $conexion->connect();
    
            // Verificar la conexión
            if (!$db) {
                throw new Exception('No se pudo conectar a la base de datos.');
            }
    
            // Ajustar el formato de la fecha con milisegundos (FF6)
            $sql = "SELECT ID_HORARIO, PATENTE_BUS, ID_RUTA FROM MFJCLPBC_HORARIO_BUS_RUTA WHERE ID_HORARIO = TO_TIMESTAMP(:id_horario, 'DD/MM/YY HH24:MI:SSXFF')";
            $stmt = oci_parse($db, $sql);
    
            // Verificar la preparación de la consulta
            if (!$stmt) {
                $e = oci_error($db);
                throw new Exception('Error al preparar la consulta: ' . $e['message']);
            }
    
            // Depuración: imprimir el valor de :id_horario
            echo "Valor de id_horario: " . htmlspecialchars($id_horario) . "<br>";
    
            oci_bind_by_name($stmt, ':id_horario', $id_horario);
    
            // Ejecutar la consulta
            if (!oci_execute($stmt)) {
                $e = oci_error($stmt);
                throw new Exception('Error al ejecutar la consulta: ' . $e['message']);
            }
    
            $horario = oci_fetch_assoc($stmt);
    
            oci_free_statement($stmt);
    
            return $horario;
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return null;
        }
    }
    
public static function getHorariosDisponibles($origen, $destino, $fecha_viaje): array {
    try {
        $conexion = new Conexion();
        $db = $conexion->connect();

        // Convertir la fecha a formato Oracle
        $fecha_viaje = date('d-M-Y', strtotime($fecha_viaje));

        // Depuración: imprimir el valor de fecha_viaje
        echo "Fecha de viaje formateada: " . htmlspecialchars($fecha_viaje) . "<br>";

        $sql = "BEGIN Consultar_Horarios(:origen, :destino, TO_DATE(:fecha_viaje, 'DD-MON-YYYY'), :cur_horarios); END;";
        $stmt = oci_parse($db, $sql);

        $cursor = oci_new_cursor($db);
        oci_bind_by_name($stmt, ':origen', $origen);
        oci_bind_by_name($stmt, ':destino', $destino);
        oci_bind_by_name($stmt, ':fecha_viaje', $fecha_viaje);
        oci_bind_by_name($stmt, ':cur_horarios', $cursor, -1, OCI_B_CURSOR);

        // Depuración: verificar si la consulta se preparó correctamente
        if (!$stmt) {
            $e = oci_error($db);
            throw new Exception('Error al preparar la consulta: ' . $e['message']);
        }

        oci_execute($stmt);
        oci_execute($cursor);

        $horarios = [];
        while (($row = oci_fetch_assoc($cursor)) !== false) {
            $horarios[] = $row;
        }

        oci_free_statement($stmt);
        oci_free_statement($cursor);

        return $horarios;
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
        return [];
    }
}
}

?>