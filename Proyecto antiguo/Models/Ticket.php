<?php
namespace App\Models;

use Illuminate\Support\Facades\Date;

class Ticket
{
    // Properties
    public int $id_ticket;
    public string $rut_cliente;
    public Date $id_horaio;
    public int $precio_ticket;
    public int $nro_asiento;
    public string $patente_bus;

    // Constructor
    public function __construct(int $id_ticket, string $rut_cliente, Date $id_horaio, int $precio_ticket, int $nro_asiento, string $patente_bus)
    {
        $this->id_ticket = $id_ticket;
        $this->rut_cliente = $rut_cliente;
        $this->id_horaio = $id_horaio;
        $this->precio_ticket = $precio_ticket;
        $this->nro_asiento = $nro_asiento;
        $this->patente_bus = $patente_bus;
    }

    // Methods
    public function getIdTicket(): int
    {
        return $this->id_ticket;
    }

    public function getRutCliente(): string
    {
        return $this->rut_cliente;
    }

    public function getIdHorario(): Date
    {
        return $this->id_horaio;
    }

    public function getPrecioTicket(): int
    {
        return $this->precio_ticket;
    }

    public function getNroAsiento(): int
    {
        return $this->nro_asiento;
    }

    public function getPatenteBus(): string
    {
        return $this->patente_bus;
    }

    public function setIdTicket(int $id_ticket): void
    {
        $this->id_ticket = $id_ticket;
    }

    public function setRutCliente(string $rut_cliente): void
    {
        $this->rut_cliente = $rut_cliente;
    }

    public function setIdHorario(Date $id_horaio): void
    {
        $this->id_horaio = $id_horaio;
    }

    public function setPrecioTicket(int $precio_ticket): void
    {
        $this->precio_ticket = $precio_ticket;
    }

    public function setNroAsiento(int $nro_asiento): void
    {
        $this->nro_asiento = $nro_asiento;
    }

    public function setPatenteBus(string $patente_bus): void
    {
        $this->patente_bus = $patente_bus;
    }
}
?>