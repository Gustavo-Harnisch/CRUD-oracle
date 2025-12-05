<?php
require_once '../Models/MRegister.php';
require_once '../Models/ConexionBase.php';

use App\Models\MRegister;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recibir los datos del formulario
    $rut = $_POST['rut'] ?? null;
    $first_name = $_POST['first_name'] ?? null;
    $last_name_p = $_POST['last_name_p'] ?? null;
    $last_name_m = $_POST['last_name_m'] ?? null;
    $phone = $_POST['phone'] ?? null;
    $emergency_phone = $_POST['emergency_phone'] ?? null;
    $region = $_POST['region'] ?? null;
    $city = $_POST['city'] ?? null;
    $password = $_POST['password'] ?? null;

    // Verificar que todos los datos estén presentes
    if ($rut && $first_name && $last_name_p && $last_name_m && $phone && $emergency_phone && $region && $city && $password) {
        // Crear una instancia de MRegister
        $cliente = new MRegister($rut, $first_name, $last_name_p, $last_name_m, $phone, $emergency_phone, $password);

        // Guardar el cliente en la base de datos
        if ($cliente->save()) {
            echo "<script>
                    alert('Registro exitoso');
                    window.location.href = '../view/Principal.php';
                </script>";
        } else {
            echo "<script>
                    alert('Error al registrar el cliente');
                    window.location.href = '../view/Register.php';
                </script>";
        }
    } else {
        echo "<script>
                alert('Faltan datos del formulario');
                window.location.href = '../view/Register.php';
            </script>";
    }
} else {
    echo "<script>
            alert('Método no permitido');
            window.location.href = '../view/Register.php';
        </script>";
}
?>