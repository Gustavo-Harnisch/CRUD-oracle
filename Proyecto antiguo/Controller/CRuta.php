<?php
require_once __DIR__ . '/../Models/MRuta.php';

use App\Models\MRuta;

if (isset($_GET['action']) && $_GET['action'] === 'getRutas') {
    try {
        $rutas = MRuta::getAll();
        echo json_encode(['rutas' => $rutas]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>