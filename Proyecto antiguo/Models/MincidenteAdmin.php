<?php
namespace App\Models;

use Exception;
//use para tipo date


require_once __DIR__ . '/Conexion.php';

class MincidenteAdmin{
    private $db;

    public function __construct(){
        $conexion = new Conexion();
        $this->db = $conexion->connect();
    }

    public function getGravedadTexto($gravedad) {
        switch ($gravedad) {
            case 1: return 'Leve';
            case 2: return 'Moderada';
            case 3: return 'Grave';
            default: return 'Desconocida';
        }
    }
    
    public function getIncidentes(): array {
        try {
            putenv('NLS_LANG=AMERICAN_AMERICA.AL32UTF8'); // Configuración de idioma para Oracle
    
            // Procedimiento almacenado
            $sql = "BEGIN Consultar_Incidentes(:cur_incidentes); END;";
            $stmt = oci_parse($this->db, $sql);
    
            // Crear cursor para el parámetro de salida
            $cursor = oci_new_cursor($this->db);
            oci_bind_by_name($stmt, ':cur_incidentes', $cursor, -1, OCI_B_CURSOR);
    
            // Ejecutar el procedimiento almacenado
            if (!oci_execute($stmt)) {
                throw new Exception('Error al ejecutar el procedimiento almacenado.');
            }
    
            // Ejecutar el cursor
            if (!oci_execute($cursor)) {
                throw new Exception('Error al ejecutar el cursor.');
            }
    
            // Procesar el cursor
            $incidentes = [];
            while (($row = oci_fetch_assoc($cursor)) !== false) {
                $incidentes[] = [
                    'id_incidente' => $row['ID_INCIDENTE'] ?? null,
                    'patente_bus' => $row['PATENTE_BUS'] ?? null,
                    'descripcion_incidente' => $row['DESCRIPCION_INCIDENTE'] ?? null,
                    'fecha_incidente' => $row['FECHA_INCIDENTE'] ?? null,
                    // Convertir gravedad numérica a texto
                    'gravedad_incidente' => $this->getGravedadTexto($row['GRAVEDAD_INCIDENTE'] ?? null),
                ];
            }
    
            // Liberar recursos
            oci_free_statement($stmt);
            oci_free_statement($cursor);
    
            return $incidentes; // Retornar los datos como un arreglo
        } catch (Exception $e) {
            error_log('Error en getIncidentes: ' . $e->getMessage());
            return [];
        }
    }
    
}
?>