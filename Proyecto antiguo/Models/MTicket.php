<?php
namespace App\Models;

require_once __DIR__ . '/Conexion.php';

use Exception;

class Mticket {
    private $id_horario;
    private $id_ticket;
    private $precio_ticket;
    private $id_asiento;
    private $rut_cliente;
    private $patente_bus;
    private $db;

    public function __construct() {
        $conexion = new Conexion();
        $this->db = $conexion->connect();
    }

    public static function insertarTicket($id_horario, $id_ticket, $precio_ticket, $id_asiento, $rut_cliente, $patente_bus) {
        try {
            $conexion = new Conexion();
            $db = $conexion->connect();
    
            $sql = "INSERT INTO MFJCLPBC_Ticket (ID_HORARIO, ID_TICKET, PRECIO_TICKET, ID_ASIENTO, RUT_CLIENTE, PATENTE_BUS) 
                    VALUES (TO_DATE(:id_horario, 'DD-MON-YY HH24:MI:SS.FF'), :id_ticket, :precio_ticket, :id_asiento, :rut_cliente, :patente_bus)";
            $stmt = oci_parse($db, $sql);
            oci_bind_by_name($stmt, ':id_horario', $id_horario);
            oci_bind_by_name($stmt, ':id_ticket', $id_ticket);
            oci_bind_by_name($stmt, ':precio_ticket', $precio_ticket);
            oci_bind_by_name($stmt, ':id_asiento', $id_asiento);
            oci_bind_by_name($stmt, ':rut_cliente', $rut_cliente);
            oci_bind_by_name($stmt, ':patente_bus', $patente_bus);
    
            $resultado = oci_execute($stmt);
    
            oci_free_statement($stmt);
    
            return $resultado;
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }
}


?>