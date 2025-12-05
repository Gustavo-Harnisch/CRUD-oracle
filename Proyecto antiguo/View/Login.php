<?php
require_once '../Controller/CLogin.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - C&C Turismo y Viajes</title>
    <style>
        body {
            background: url(images/8.JPG);
            background-size: cover;
            margin: 0;
            font-family: 'Arial', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #333;
            overflow: hidden;
        }
        .form-box {
            background: #FFF;
            padding: 30px 40px;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 400px;
            position: relative;
            transform: scale(0.9);
            animation: popIn 0.6s ease forwards;
        }
        @keyframes popIn {
            0% {
                transform: scale(0.5);
                opacity: 0;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        .form-box h2 {
            margin: 0 0 20px;
            text-align: center;
            color: #0F2027;
            animation: fadeIn 1s ease;
        }
        @keyframes fadeIn {
            0% {
                opacity: 0;
                transform: translateY(-20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .form-box form {
            display: flex;
            flex-direction: column;
        }
        .form-box input {
            padding: 12px 15px;
            margin: 10px 0;
            border: 1px solid #CCC;
            border-radius: 5px;
            font-size: 1rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        .form-box input:focus {
            outline: none;
            border-color: #F9A826;
            box-shadow: 0 0 8px rgba(249, 168, 38, 0.5);
            transform: scale(1.02);
        }
        .form-box button {
            padding: 12px;
            margin-top: 15px;
            background: linear-gradient(135deg, #FF7E5F, #F9A826);
            color: #FFF;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
        }
        .form-box button:hover {
            background: linear-gradient(135deg, #FF3366, #F9A826);
            transform: scale(1.05);
        }
        .form-box .toggle-link {
            text-align: center;
            margin-top: 20px;
            animation: fadeIn 1s ease;
        }
        .form-box .toggle-link a {
            color: #F9A826;
            text-decoration: none;
            font-weight: bold;
            transition: color 0.3s;
        }
        .form-box .toggle-link a:hover {
            color: #FF3366;
        }
        .back-link {
            display: block; /* Asegura que el enlace se comporte como un bloque */
            text-align: center; /* Centra el texto */
            margin-bottom: 20px; /* Espaciado entre el enlace y el contenido principal */
            color: #F9A826;
            text-decoration: none;
            font-weight: bold;
            font-size: 1rem;
            animation: fadeIn 1s ease;
        }
        .back-link:hover {
            color: #FF3366; /* Cambia de color cuando se pasa el cursor */
        }
        .error {
            color: red;
            text-align: center;
            margin-top: 10px;
        }
    </style>
    <script>
        function formatearRUT(rut) {
            rut = rut.replace(/[.-]/g, '');
            const cuerpo = rut.slice(0, -1);
            const dv = rut.slice(-1).toUpperCase();
            return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
        }

        document.addEventListener('DOMContentLoaded', function() {
            const rutInput = document.getElementById('rut_cliente');
            rutInput.addEventListener('input', function() {
                rutInput.value = formatearRUT(rutInput.value);
            });
        });
    </script>
</head>
<body>
    <div class="form-box">
        <a href="principal.php" class="back-link">Volver al inicio</a>
        <h2>Iniciar Sesión</h2>
        <form action="../Controller/CLogin.php" method="POST">
            <label for="rut_cliente">RUT:</label>
            <input type="text" id="rut_cliente" name="rut_cliente" placeholder="Ejemplo: 12.345.678-9" required autocomplete="off">
            
            <label for="contrasena_cliente">Contraseña:</label>
            <input type="password" id="contrasena_cliente" name="contrasena_cliente" placeholder="Contraseña" required autocomplete="off">
            
            <button type="submit">Entrar</button>
        </form>
        <div class="toggle-link">
            <p>¿No tienes cuenta? <a href="Register.php">Regístrate aquí</a></p>
        </div>
        <div class="error">
            <!-- Mensajes de error se mostrarán aquí -->
        </div>
    </div>
</body>
</html>