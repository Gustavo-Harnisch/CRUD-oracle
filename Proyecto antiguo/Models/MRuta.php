<?php
namespace App\Models;

use Exception;

require_once __DIR__ . '/Conexion.php';

class MRuta {
    private int $id_ruta;
    private string $origen_ruta;
    private string $destino_ruta;
    private float $distancia_ruta;
    private float $duracion_estimada_ruta;
    private float $precio_ruta;
    private $db;

    public function __construct($id_ruta, $origen_ruta, $destino_ruta, $distancia_ruta, $duracion_estimada_ruta, $precio_ruta) {
        $this->id_ruta = $id_ruta;
        $this->origen_ruta = $origen_ruta;
        $this->destino_ruta = $destino_ruta;
        $this->distancia_ruta = $distancia_ruta;
        $this->duracion_estimada_ruta = $duracion_estimada_ruta;
        $this->precio_ruta = $precio_ruta;

        // Usar la conexión de Conexion
        $conexion = new Conexion();
        $this->db = $conexion->connect();
    }

    // Guardar ruta
    public function save(): bool {
        try {
            $sql = "BEGIN CRUD_RUTA('C', :id_ruta, :origen_ruta, :destino_ruta, :distancia_ruta, :duracion_estimada_ruta, :precio_ruta, NULL); END;";
            $stmt = oci_parse($this->db, $sql);
            oci_bind_by_name($stmt, ':id_ruta', $this->id_ruta);
            oci_bind_by_name($stmt, ':origen_ruta', $this->origen_ruta);
            oci_bind_by_name($stmt, ':destino_ruta', $this->destino_ruta);
            oci_bind_by_name($stmt, ':distancia_ruta', $this->distancia_ruta);
            oci_bind_by_name($stmt, ':duracion_estimada_ruta', $this->duracion_estimada_ruta);
            oci_bind_by_name($stmt, ':precio_ruta', $this->precio_ruta);
            return oci_execute($stmt);
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    // Buscar una ruta por ID
    public static function find(int $id_ruta): ?MRuta {
        try {
            $conexion = new Conexion();
            $db = $conexion->connect();

            $sql = "BEGIN CRUD_RUTA('R', :id_ruta, NULL, NULL, NULL, NULL, NULL, :cur_rutas); END;";
            $stmt = oci_parse($db, $sql);

            $cursor = oci_new_cursor($db);
            oci_bind_by_name($stmt, ':id_ruta', $id_ruta);
            oci_bind_by_name($stmt, ':cur_rutas', $cursor, -1, OCI_B_CURSOR);

            oci_execute($stmt);
            oci_execute($cursor);

            $data = oci_fetch_assoc($cursor);
            oci_free_statement($stmt);
            oci_free_statement($cursor);

            if ($data) {
                return new MRuta($data['ID_RUTA'], $data['ORIGEN_RUTA'], $data['DESTINO_RUTA'], $data['DISTANCIA_RUTA'], $data['DURACION_ESTIMADA_RUTA'], $data['PRECIO_RUTA']);
            }
            return null;
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return null;
        }
    }

    // Actualizar ruta
    public function update(): bool {
        try {
            $sql = "BEGIN CRUD_RUTA('U', :id_ruta, :origen_ruta, :destino_ruta, :distancia_ruta, :duracion_estimada_ruta, :precio_ruta, NULL); END;";
            $stmt = oci_parse($this->db, $sql);
            oci_bind_by_name($stmt, ':id_ruta', $this->id_ruta);
            oci_bind_by_name($stmt, ':origen_ruta', $this->origen_ruta);
            oci_bind_by_name($stmt, ':destino_ruta', $this->destino_ruta);
            oci_bind_by_name($stmt, ':distancia_ruta', $this->distancia_ruta);
            oci_bind_by_name($stmt, ':duracion_estimada_ruta', $this->duracion_estimada_ruta);
            oci_bind_by_name($stmt, ':precio_ruta', $this->precio_ruta);
            return oci_execute($stmt);
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    // Eliminar ruta
    public function delete(): bool {
        try {
            $sql = "BEGIN CRUD_RUTA('D', :id_ruta, NULL, NULL, NULL, NULL, NULL, NULL); END;";
            $stmt = oci_parse($this->db, $sql);
            oci_bind_by_name($stmt, ':id_ruta', $this->id_ruta);
            return oci_execute($stmt);
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    // Obtener todas las rutas
    public static function getAll(): array {
        try {
            $conexion = new Conexion();
            $db = $conexion->connect();

            $sql = "BEGIN CRUD_RUTA('R', NULL, NULL, NULL, NULL, NULL, NULL, :cur_rutas); END;";
            $stmt = oci_parse($db, $sql);

            $cursor = oci_new_cursor($db);
            oci_bind_by_name($stmt, ':cur_rutas', $cursor, -1, OCI_B_CURSOR);

            oci_execute($stmt);
            oci_execute($cursor);

            $result = [];
            while (($row = oci_fetch_assoc($cursor)) !== false) {
                $result[] = $row;
            }

            oci_free_statement($stmt);
            oci_free_statement($cursor);

            return $result;
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return [];
        }
    }

    // Obtener rutas por origen
    public static function getRutasByOrigen(): array {
        try {
            $conexion = new Conexion();
            $db = $conexion->connect();
    
            // Configurar codificación UTF-8
            putenv('NLS_LANG=AMERICAN_AMERICA.AL32UTF8');
    
            $sql = "BEGIN Consultar_Origen_Ruta(:cur_origen); END;";
            $stmt = oci_parse($db, $sql);
    
            $cursor = oci_new_cursor($db);
            oci_bind_by_name($stmt, ':cur_origen', $cursor, -1, OCI_B_CURSOR);
    
            oci_execute($stmt); // Ejecuta el procedimiento
            oci_execute($cursor); // Ejecuta el cursor
    
            $origenes = [];
            while (($row = oci_fetch_assoc($cursor)) !== false) {
                // Usa mb_convert_encoding o iconv si es necesario
                $origenes[] = htmlspecialchars(mb_convert_encoding($row['ORIGEN_RUTA'], 'UTF-8', 'ISO-8859-1'));
            }
    
            oci_free_statement($stmt);
            oci_free_statement($cursor);
    
            return $origenes;
        } catch (Exception $e) {
            echo ''. $e->getMessage();
            return [];
        }
    }


    // Obtener rutas por destino
    public static function getRutasByDestino(): array {
        try {
            $conexion = new Conexion();
            $db = $conexion->connect();

            $sql = "BEGIN Consultar_Destino_Ruta(:cur_destino); END;";
            $stmt = oci_parse($db, $sql);

            $cursor = oci_new_cursor($db);
            oci_bind_by_name($stmt, ':cur_destino', $cursor, -1, OCI_B_CURSOR);

            oci_execute($stmt);
            oci_execute($cursor);

            $destinos = [];
            while (($row = oci_fetch_assoc($cursor)) !== false) {
                $destinos[] = $row['DESTINO_RUTA'];
            }

            oci_free_statement($stmt);
            oci_free_statement($cursor);

            return $destinos;
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return [];
        }
    }


    public static function getAsientosByPatente($patente_bus): array {
        try {
            $conexion = new Conexion();
            $db = $conexion->connect();
    
            $sql = "SELECT ESTADO, NUMERO_ASIENTO, ID_ASIENTO FROM MFJCLPBC_Asiento WHERE PATENTE_BUS = :patente_bus";
            $stmt = oci_parse($db, $sql);
            oci_bind_by_name($stmt, ':patente_bus', $patente_bus);
            oci_execute($stmt);
    
            $asientos = [];
            while (($row = oci_fetch_assoc($stmt)) !== false) {
                $asientos[] = $row;
            }
    
            oci_free_statement($stmt);
    
            return $asientos;
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return [];
        }
    }
}
?>
