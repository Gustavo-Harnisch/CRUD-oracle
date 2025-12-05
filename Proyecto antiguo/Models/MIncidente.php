<?php
namespace App\Models;

use DateTime;
use PDO;
use PDOException;

class MIncidente {
    private ?int $id_incidente;
    private string $patente_bus;
    private string $descripcion_incidente;
    private DateTime $fecha_incidente;
    private int $gravedad_incidente;
    private PDO $db;

    public function __construct(?int $id_incidente, string $patente_bus, string $descripcion_incidente, string $fecha_incidente, int $gravedad_incidente) {
        $this->id_incidente = $id_incidente;
        $this->patente_bus = $patente_bus;
        $this->descripcion_incidente = $descripcion_incidente;
        $this->fecha_incidente = new DateTime($fecha_incidente);
        $this->gravedad_incidente = $gravedad_incidente;

        // Usar la conexión de ConexionBase
        $conexion = new ConexionBase();
        $this->db = $conexion->connect();
    }

    // Getters and Setters...

    public function save(): bool {
        try {
            if (!$this->busExists($this->patente_bus)) {
                echo "Error: La patente del bus no existe en la base de datos.";
                return false;
            }

            $stmt = $this->db->prepare("INSERT INTO MFJCLPBC_Incidente (PATENTE_BUS, DESCRIPCION_INCIDENTE, FECHA_INCIDENTE, GRAVEDAD_INCIDENTE) VALUES (?, ?, TO_DATE(?, 'YYYY-MM-DD'), ?)");
            return $stmt->execute([$this->patente_bus, $this->descripcion_incidente, $this->fecha_incidente->format('Y-m-d'), $this->gravedad_incidente]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function update(): bool {
        try {
            if (!$this->busExists($this->patente_bus)) {
                echo "Error: La patente del bus no existe en la base de datos.";
                return false;
            }

            $stmt = $this->db->prepare("UPDATE MFJCLPBC_Incidente SET PATENTE_BUS = ?, DESCRIPCION_INCIDENTE = ?, FECHA_INCIDENTE = TO_DATE(?, 'YYYY-MM-DD'), GRAVEDAD_INCIDENTE = ? WHERE ID_INCIDENTE = ?");
            return $stmt->execute([$this->patente_bus, $this->descripcion_incidente, $this->fecha_incidente->format('Y-m-d'), $this->gravedad_incidente, $this->id_incidente]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function delete(): bool {
        try {
            $stmt = $this->db->prepare("DELETE FROM MFJCLPBC_Incidente WHERE ID_INCIDENTE = ?");
            return $stmt->execute([$this->id_incidente]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public static function find(int $id_incidente): ?MIncidente {
        try {
            $conexion = new ConexionBase();
            $db = $conexion->connect();
            $stmt = $db->prepare("SELECT * FROM MFJCLPBC_Incidente WHERE ID_INCIDENTE = ?");
            $stmt->execute([$id_incidente]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($data) {
                return new MIncidente($data['ID_INCIDENTE'], $data['PATENTE_BUS'], $data['DESCRIPCION_INCIDENTE'], $data['FECHA_INCIDENTE'], (int)$data['GRAVEDAD_INCIDENTE']);
            }
            return null;
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return null;
        }
    }

    private function busExists(string $patente_bus): bool {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM MFJCLPBC_bus WHERE PATENTE_BUS = ?");
            $stmt->execute([$patente_bus]);
            return $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }
}
?>