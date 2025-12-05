<?php
namespace App\Models;

use PDO;
use PDOException;

class MBus {
    private string $patente_bus;
    private string $modelo_bus;
    private int $capacidad_bus;
    private int $año_fabricacion_bus;
    private PDO $db;

    public function __construct($patente_bus = null, $modelo_bus = null, $capacidad_bus = null, $año_fabricacion_bus = null) {
        $this->patente_bus = $patente_bus;
        $this->modelo_bus = $modelo_bus;
        $this->capacidad_bus = $capacidad_bus;
        $this->año_fabricacion_bus = $año_fabricacion_bus;

        // Usar la conexión de ConexionBase
        $conexion = new ConexionBase();
        $this->db = $conexion->connect();
    }

    // Getters and Setters...

    public function save(): bool {
        try {
            $stmt = $this->db->prepare("INSERT INTO MFJCLPBC_bus (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus) VALUES (?, ?, ?, ?)");
            return $stmt->execute([$this->patente_bus, $this->modelo_bus, $this->capacidad_bus, $this->año_fabricacion_bus]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function update(): bool {
        try {
            $stmt = $this->db->prepare("UPDATE MFJCLPBC_bus SET modelo_bus = ?, capacidad_bus = ?, año_fabricacion_bus = ? WHERE patente_bus = ?");
            return $stmt->execute([$this->modelo_bus, $this->capacidad_bus, $this->año_fabricacion_bus, $this->patente_bus]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function delete(): bool {
        try {
            $stmt = $this->db->prepare("DELETE FROM MFJCLPBC_bus WHERE patente_bus = ?");
            return $stmt->execute([$this->patente_bus]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public static function find(string $patente_bus): ?MBus {
        try {
            $conexion = new ConexionBase();
            $db = $conexion->connect();
            $stmt = $db->prepare("SELECT * FROM MFJCLPBC_bus WHERE patente_bus = ?");
            $stmt->execute([$patente_bus]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($data) {
                return new MBus($data['patente_bus'], $data['modelo_bus'], $data['capacidad_bus'], $data['año_fabricacion_bus']);
            }
            return null;
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return null;
        }
    }

    public function getPatenteBus(): string {
        return $this->patente_bus;
    }

    public function getModeloBus(): string {
        return $this->modelo_bus;
    }

    public function getCapacidadBus(): int {
        return $this->capacidad_bus;
    }

    public function getAñoFabricacionBus(): int {
        return $this->año_fabricacion_bus;
    }
}
?>