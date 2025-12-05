<?php
namespace App\Models;

use PDO;
use PDOException;

require_once __DIR__ . '/ConexionBase.php';

class MRegister {
    private string $rut;
    private string $first_name;
    private string $last_name_p;
    private string $last_name_m;
    private string $phone;
    private string $emergency_phone;
    private string $password;
    private PDO $db;

    public function __construct($rut = null, $first_name = null, $last_name_p = null, $last_name_m = null, $phone = null, $emergency_phone = null, $password = null) {
        $this->rut = $rut;
        $this->first_name = $first_name;
        $this->last_name_p = $last_name_p;
        $this->last_name_m = $last_name_m;
        $this->phone = $phone;
        $this->emergency_phone = $emergency_phone;
        $this->password = $password;

        // Usar la conexión de ConexionBase
        $conexion = new ConexionBase();
        $this->db = $conexion->connect();
    }

    public function save(): bool {
        try {
            $stmt = $this->db->prepare("INSERT INTO MFJCLPBC_CLIENTE (RUT_CLIENTE, NOMBRE_CLIENTE, APELLIDOPATERNO_CLIENTE, APELLIDOMATERNO_CLIENTE, TELEFONO_CLIENTE, CONTACTO_EMERGENCIA, CONTRASENA_CLIENTE) VALUES (?, ?, ?, ?, ?, ?, ?)");
            return $stmt->execute([$this->rut, $this->first_name, $this->last_name_p, $this->last_name_m, $this->phone, $this->emergency_phone, $this->password]);
        } catch (PDOException $e) {
            // Handle error
            echo "Error: " . $e->getMessage();
            return false;
        }
    }
}
?>