<?php
namespace App\Models;

use PDO;
use PDOException;

class Mmantenimiento {
    private int $id_mantenimiento;
    private string $fecha_mantenimiento;
    private string $patente_bus;
    private int $id_detalle;
    private float $costo_mantenimiento;
    private string $estado_mantenimiento;
    private string $descripcion_mantenimiento;
    private PDO $db;

    public function __construct($id_mantenimiento = null, $fecha_mantenimiento = null, $patente_bus = null, $id_detalle = null, $costo_mantenimiento = null, $estado_mantenimiento = null, $descripcion_mantenimiento = null) {
        $this->id_mantenimiento = $id_mantenimiento;
        $this->fecha_mantenimiento = $fecha_mantenimiento;
        $this->patente_bus = $patente_bus;
        $this->id_detalle = $id_detalle;
        $this->costo_mantenimiento = $costo_mantenimiento;
        $this->estado_mantenimiento = $estado_mantenimiento;
        $this->descripcion_mantenimiento = $descripcion_mantenimiento;

        // Usar la conexión de ConexionBase
        $conexion = new ConexionBase();
        $this->db = $conexion->connect();
    }

    // Getters and Setters...

    public function save(): bool {
        try {
            $this->db->beginTransaction();

            // Insertar en MFJCLPBC_MANTENIMIENTO
            $stmt = $this->db->prepare("INSERT INTO MFJCLPBC_mantenimiento (ID_MANTENIMIENTO, FECHA_MANTENIMIENTO, PATENTE_BUS) VALUES (?, ?, ?)");
            $stmt->execute([$this->id_mantenimiento, $this->fecha_mantenimiento, $this->patente_bus]);

            // Insertar en MFJCLPBC_DETALLE_MANTENIMIENTO
            $stmt = $this->db->prepare("INSERT INTO MFJCLPBC_detalle_mantenimiento (ID_DETALLE, ID_MANTENIMIENTO, COSTO_MANTENIMIENTO, ESTADO_MANTENIMIENTO, DESCRIPCION_MANTENIMIENTO) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$this->id_detalle, $this->id_mantenimiento, $this->costo_mantenimiento, $this->estado_mantenimiento, $this->descripcion_mantenimiento]);

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function update(): bool {
        try {
            $this->db->beginTransaction();

            // Actualizar en MFJCLPBC_MANTENIMIENTO
            $stmt = $this->db->prepare("UPDATE MFJCLPBC_mantenimiento SET FECHA_MANTENIMIENTO = ?, PATENTE_BUS = ? WHERE ID_MANTENIMIENTO = ?");
            $stmt->execute([$this->fecha_mantenimiento, $this->patente_bus, $this->id_mantenimiento]);

            // Actualizar en MFJCLPBC_DETALLE_MANTENIMIENTO
            $stmt = $this->db->prepare("UPDATE MFJCLPBC_detalle_mantenimiento SET COSTO_MANTENIMIENTO = ?, ESTADO_MANTENIMIENTO = ?, DESCRIPCION_MANTENIMIENTO = ? WHERE ID_DETALLE = ?");
            $stmt->execute([$this->costo_mantenimiento, $this->estado_mantenimiento, $this->descripcion_mantenimiento, $this->id_detalle]);

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function delete(): bool {
        try {
            $this->db->beginTransaction();

            // Eliminar de MFJCLPBC_DETALLE_MANTENIMIENTO
            $stmt = $this->db->prepare("DELETE FROM MFJCLPBC_detalle_mantenimiento WHERE ID_DETALLE = ?");
            $stmt->execute([$this->id_detalle]);

            // Eliminar de MFJCLPBC_MANTENIMIENTO
            $stmt = $this->db->prepare("DELETE FROM MFJCLPBC_mantenimiento WHERE ID_MANTENIMIENTO = ?");
            $stmt->execute([$this->id_mantenimiento]);

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public static function find(int $id_mantenimiento): ?Mmantenimiento {
        try {
            $conexion = new ConexionBase();
            $db = $conexion->connect();
            $stmt = $db->prepare("SELECT m.ID_MANTENIMIENTO, m.FECHA_MANTENIMIENTO, m.PATENTE_BUS, d.ID_DETALLE, d.COSTO_MANTENIMIENTO, d.ESTADO_MANTENIMIENTO, d.DESCRIPCION_MANTENIMIENTO 
                                  FROM MFJCLPBC_mantenimiento m 
                                  JOIN MFJCLPBC_detalle_mantenimiento d ON m.ID_MANTENIMIENTO = d.ID_MANTENIMIENTO 
                                  WHERE m.ID_MANTENIMIENTO = ?");
            $stmt->execute([$id_mantenimiento]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($data) {
                return new Mmantenimiento(
                    $data['ID_MANTENIMIENTO'],
                    $data['FECHA_MANTENIMIENTO'],
                    $data['PATENTE_BUS'],
                    $data['ID_DETALLE'],
                    $data['COSTO_MANTENIMIENTO'],
                    $data['ESTADO_MANTENIMIENTO'],
                    $data['DESCRIPCION_MANTENIMIENTO']
                );
            }
            return null;
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return null;
        }
    }

    // Getters and Setters...

    public function getIdMantenimiento(): int {
        return $this->id_mantenimiento;
    }

    public function getFechaMantenimiento(): string {
        return $this->fecha_mantenimiento;
    }

    public function getPatenteBus(): string {
        return $this->patente_bus;
    }

    public function getIdDetalle(): int {
        return $this->id_detalle;
    }

    public function getCostoMantenimiento(): float {
        return $this->costo_mantenimiento;
    }

    public function getEstadoMantenimiento(): string {
        return $this->estado_mantenimiento;
    }

    public function getDescripcionMantenimiento(): string {
        return $this->descripcion_mantenimiento;
    }
}
?>