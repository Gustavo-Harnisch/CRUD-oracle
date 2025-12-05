<?php
namespace App\Models;
class Conexion {
    private $host = 'localhost';
    private $port = '1521'; // Puerto por defecto de Oracle
    private $service = 'XE'; // Nombre del servicio o SID
    private $user = 'system';
    private $pass = 'proyecto';
    private $conn;

    public function connect() {
        $this->conn = null;

        try {
            $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$this->host})(PORT={$this->port}))(CONNECT_DATA=(SERVICE_NAME={$this->service})))";
            $this->conn = oci_connect($this->user, $this->pass, $dsn);

            if (!$this->conn) {
                $error = oci_error();
                throw new \Exception("Error al conectar a la base de datos: " . $error['message']);
            }
        } catch (\Exception $e) {
            echo "Connection error: " . $e->getMessage();
        }

        return $this->conn;
    }

    public function disconnect() {
        if ($this->conn) {
            oci_close($this->conn);
        }
    }
}
?>

