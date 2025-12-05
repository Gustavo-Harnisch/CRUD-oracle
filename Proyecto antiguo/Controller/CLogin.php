<?php
require_once '../Models/ConexionBase.php'; 
require_once '../Models/MCliente.php'; 

use App\Models\ConexionBase;

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rut_cliente = $_POST['rut_cliente'] ?? null;
    $contrasena_cliente = $_POST['contrasena_cliente'] ?? null;

    if ($rut_cliente && $contrasena_cliente) {
        try {
            $conexion = new ConexionBase();
            $db = $conexion->connect();

            // Verificar si es un cliente
            $stmt = $db->prepare("SELECT * FROM MFJCLPBC_cliente WHERE rut_cliente = :rut_cliente AND contrasena_cliente = :contrasena_cliente");
            $stmt->bindParam(':rut_cliente', $rut_cliente);
            $stmt->bindParam(':contrasena_cliente', $contrasena_cliente);
            $stmt->execute();
            $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($cliente) {
                $_SESSION['cliente'] = [
                    'nombre' => $cliente['nombre_cliente'],
                    'apellido' => $cliente['apellido_paterno_cliente'] . ' ' . $cliente['apellido_materno_cliente']
                ];
                echo "<script>
                    alert('Inicio de sesión exitoso');
                    window.location.href = '../view/Principal.php';
                </script>";
                exit;
            } else {
                // Verificar si es un administrador
                $stmt = $db->prepare("SELECT * FROM MFJCLPBC_admin WHERE rut_admin = :rut_cliente AND contraseña_admin = :contrasena_cliente");
                $stmt->bindParam(':rut_cliente', $rut_cliente);
                $stmt->bindParam(':contrasena_cliente', $contrasena_cliente);
                $stmt->execute();
                $admin = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($admin) {
                    $_SESSION['admin'] = [
                        'rut' => $admin['rut_admin']
                    ];
                    echo "<script>
                        alert('Inicio de sesión exitoso');
                        window.location.href = '../view/principalAdmin.php';
                    </script>";
                    exit;
                } else {
                    echo "<script>
                        alert('Rut o contraseña incorrecta');
                        window.location.href = '../view/login.php';
                    </script>";
                }
            }
        } catch (PDOException $e) {
            $error = "Error al conectar con la base de datos: " . $e->getMessage();
        }
    } else {
        $error = "Por favor, complete todos los campos.";
    }
} else {
}

if (isset($error)) {
    echo "<script>
        document.addEventListener('DOMContentLoaded', function() {
            const errorDiv = document.querySelector('.error');
            errorDiv.textContent = '$error';
        });
    </script>";
}
?>