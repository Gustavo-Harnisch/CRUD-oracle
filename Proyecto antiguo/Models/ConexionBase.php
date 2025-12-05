<?php
namespace App\Models;

use PDO;
use PDOException;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class ConexionBase {
    private $host = 'localhost';
    private $db = 'XE';
    private $user = 'system';
    private $pass = 'proyecto';
    private $charset = 'AL32UTF8';
    private $conn;

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO("oci:dbname=".$this->host."/".$this->db.";charset=".$this->charset, $this->user, $this->pass);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo "Connection error: " . $e->getMessage();
        }

        return $this->conn;
    }
}

$conexion = new ConexionBase();
$conn = $conexion->connect();
if ($conn) {;
} else {
    echo "No se pudo establecer la conexión";
}
