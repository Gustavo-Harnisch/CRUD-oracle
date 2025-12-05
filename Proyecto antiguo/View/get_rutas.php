<?php

require_once __DIR__ . '/../Models/MRuta.php';
use App\Models\MRuta;

$origenes = MRuta::getRutasByOrigen();
$destinos = MRuta::getRutasByDestino();

header('Content-Type: application/json');
echo json_encode(['origenes' => $origenes, 'destinos' => $destinos]);
?>