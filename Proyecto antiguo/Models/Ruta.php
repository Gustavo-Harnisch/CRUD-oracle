<?php
namespace App\Models;

use PhpParser\Node\Expr\Cast\Double;

class Ruta {
    public int $id_ruta;
    public string $origen_ruta;
    public string $destino_ruta;
    public int $distancia_ruta;
    public float $duracion_ruta;
    public int $precio_ruta;

    public function __construct(int $id_ruta, string $origen_ruta, string $destino_ruta, int $distancia_ruta, float $duracion_ruta, int $precio_ruta) {
        $this->id_ruta = $id_ruta;
        $this->origen_ruta = $origen_ruta;
        $this->destino_ruta = $destino_ruta;
        $this->distancia_ruta = $distancia_ruta;
        $this->duracion_ruta = $duracion_ruta;
        $this->precio_ruta = $precio_ruta;
    }

    public function getIdRuta(): int {
        return $this->id_ruta;
    }

    public function getOrigenRuta(): string {
        return $this->origen_ruta;
    }

    public function getDestinoRuta(): string {
        return $this->destino_ruta;
    }

    public function getDistanciaRuta(): int {
        return $this->distancia_ruta;
    }

    public function getDuracionRuta(): float {
        return $this->duracion_ruta;
    }

    public function getPrecioRuta(): int {
        return $this->precio_ruta;
    }

    public function setIdRuta(int $id_ruta): void {
        $this->id_ruta = $id_ruta;
    }

    public function setOrigenRuta(string $origen_ruta): void {
        $this->origen_ruta = $origen_ruta;
    }

    public function setDestinoRuta(string $destino_ruta): void {
        $this->destino_ruta = $destino_ruta;
    }

    public function setDistanciaRuta(int $distancia_ruta): void {
        $this->distancia_ruta = $distancia_ruta;
    }

    public function setDuracionRuta(float $duracion_ruta): void {
        $this->duracion_ruta = $duracion_ruta;
    }

    public function setPrecioRuta(int $precio_ruta): void {
        $this->precio_ruta = $precio_ruta;
    }
}
?>