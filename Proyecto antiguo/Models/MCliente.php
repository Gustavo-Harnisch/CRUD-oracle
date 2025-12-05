<?php
namespace App\Models;

use DateTime;
use PDO;
use PDOException;
class MCliente {
    private string $rut_cliente;
    private int $id_direccion;
    private string $nombre_cliente;
    private string $apellido_paterno_cliente;
    private string $apellido_materno_cliente;
    private int $telefono_cliente;
    private string $contacto_emergencia;
    private string $contrasena_cliente;
    private PDO $db;

    public function __construct($rut_cliente, $id_direccion, $nombre_cliente, $apellido_paterno_cliente, $apellido_materno_cliente, $telefono_cliente, $contacto_emergencia, $contrasena_cliente) {
        $this->rut_cliente = $rut_cliente;
        $this->id_direccion = $id_direccion;
        $this->nombre_cliente = $nombre_cliente;
        $this->apellido_paterno_cliente = $apellido_paterno_cliente;
        $this->apellido_materno_cliente = $apellido_materno_cliente;
        $this->telefono_cliente = $telefono_cliente;
        $this->contacto_emergencia = $contacto_emergencia;
        $this->contrasena_cliente = $contrasena_cliente;

        // Usar la conexión de ConexionBase
        $conexion = new ConexionBase();
        $this->db = $conexion->connect();
    }

    // Getters and Setters...

    public function save(): bool {
        try {
            $stmt = $this->db->prepare("INSERT INTO MFJCLPBC_cliente (rut_cliente, id_direccion, nombre_cliente, apellidoPaterno_cliente, apellidoMaterno_cliente, telefono_cliente, contacto_emergencia, contrasena_cliente) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            return $stmt->execute([$this->rut_cliente, $this->id_direccion, $this->nombre_cliente, $this->apellido_paterno_cliente, $this->apellido_materno_cliente, $this->telefono_cliente, $this->contacto_emergencia, $this->contrasena_cliente]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function update(): bool {
        try {
            $stmt = $this->db->prepare("UPDATE MFJCLPBC_cliente SET id_direccion = ?, nombre_cliente = ?, apellidoPaterno_cliente = ?, apellidoMaterno_cliente = ?, telefono_cliente = ?, contacto_emergencia = ?, contrasena_cliente = ? WHERE rut_cliente = ?");
            return $stmt->execute([$this->id_direccion, $this->nombre_cliente, $this->apellido_paterno_cliente, $this->apellido_materno_cliente, $this->telefono_cliente, $this->contacto_emergencia, $this->contrasena_cliente, $this->rut_cliente]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public function delete(): bool {
        try {
            $stmt = $this->db->prepare("DELETE FROM MFJCLPBC_cliente WHERE rut_cliente = ?");
            return $stmt->execute([$this->rut_cliente]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    public static function find(string $rut_cliente): ?MCliente {
        try {
            $conexion = new ConexionBase();
            $db = $conexion->connect();
            $stmt = $db->prepare("SELECT * FROM MFJCLPBC_cliente WHERE rut_cliente = ?");
            $stmt->execute([$rut_cliente]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($data) {
                return new MCliente($data['rut_cliente'], $data['id_direccion'], $data['nombre_cliente'], $data['apellidoPaterno_cliente'], $data['apellidoMaterno_cliente'], $data['telefono_cliente'], $data['contacto_emergencia'], $data['contrasena_cliente']);
            }
            return null;
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return null;
        }
    }
    public static function authenticate($rut_cliente, $contrasena_cliente): ?MCliente {
        try {
            $conexion = new ConexionBase();
            $db = $conexion->connect();
            $stmt = $db->prepare("SELECT * FROM MFJCLPBC_cliente WHERE rut_cliente = ? AND contrasena_cliente = ?");
            $stmt->execute([$rut_cliente, $contrasena_cliente]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if ($data) {
                return new MCliente(
                    $data['rut_cliente'] ?? '',
                    $data['id_direccion'] ?? 0,
                    $data['nombre_cliente'] ?? '',
                    $data['apellido_paterno_cliente'] ?? '',
                    $data['apellido_materno_cliente'] ?? '',
                    $data['telefono_cliente'] ?? 0,
                    $data['contacto_emergencia'] ?? '',
                    $data['contrasena_cliente'] ?? ''
                );
            }
            return null;
        } catch (PDOException $e) {
            // Manejo de errores
            echo "Error en la base de datos: " . $e->getMessage();
            return null;
        }
    }
    
    public function getNombreCliente(): string {
        return $this->nombre_cliente;
    }
    
    public function getApellidoPaternoCliente(): string {
        return $this->apellido_paterno_cliente;
    }
}
?>