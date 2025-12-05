<?php
require_once '../Models/ConexionBase.php';
require_once '../Controller/CReseña.php';

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reseñas - C&C Turismo y Viajes</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

        body {
            background: url('images/5.jpg'); /* Cambiar por imagen real */
            background-size: cover;
            margin: 0;
            font-family: 'Roboto', sans-serif;
            color: #333;
            background-color: #f7f7f7;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
       
          /* Navegación */
          nav {
            background: linear-gradient(90deg, #0F2027, #203A43, #2C5364); /* Gradiente llamativo */
            padding: 5px 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-bottom: 3px solid #F9A826;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Sombra elegante */
            position: sticky;
            top: 0; /* Fija la navegación al hacer scroll */
            z-index: 1000; /* Asegura que esté por encima de otros elementos */
        }
        .nav-left {
            margin-right: auto; /* Asegura que el contenedor esté alineado a la izquierda */
        }

        .nav-left img {
            height: 60px; /* Ajusta el tamaño del logo según sea necesario */
        }
        .nav-links {
            display: flex;
            gap: 40px;
        }

        nav a {
            color: #F1F1F1;
            text-decoration: none;
            font-size: 1rem;
            font-weight: bold;
            transition: color 0.3s, transform 0.2s; /* Efectos suaves */
            position: relative;
        }

        nav a:hover {
            color: #FF3366;
            transform: scale(1.1); /* Agranda el texto */
        }

        nav a::after {
            content: '';
            position: absolute;
            width: 0;
            height: 3px;
            background: #F9A826;
            left: 50%;
            bottom: -5px;
            transition: all 0.3s ease-in-out;
            transform: translateX(-50%);
        }

        nav a:hover::after {
            width: 100%; /* Subraya el enlace al pasar el mouse */
        }

        .nav-right {
            margin-left: auto; /* Asegura que el contenedor esté alineado a la derecha */
        }

        .nav-right .btn-entrar {
            padding: 8px 20px;
            background-color: #F9A826;
            color: #0F2027;
            border: none;
            border-radius: 20px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
            text-decoration: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Sombra en el botón */
        }

        .nav-right .btn-entrar:hover {
            background: #FF3366;
            color: white;
            transform: scale(1.1); /* Agranda el botón */
        }
        
        main {
            padding: 40px 20px;
            max-width: 1200px;
            margin: auto;
            animation: fadeIn 1s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        h1 {
            text-align: center;
            font-size: 3rem;
            color: #FF3366;
            margin-bottom: 20px;
            animation: slideIn 1s ease-in-out;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        form {
            background: white;  
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: auto;
            animation: zoomIn 0.5s ease-in-out;
        }

        @keyframes zoomIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-weight: bold;
            margin-bottom: 10px;
            color: #0F2027;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
            transition: border-color 0.3s;
            font-size: 1rem;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            border-color: #FF3366;
            outline: none;
        }

        textarea {
            resize: none;
            height: 200px;
        }

        button {
            width: 100%;
            background-color: #F9A826;
            color: #0F2027;
            padding: 15px 20px;
            font-size: 1.2rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
        }

        button:hover {
            background-color: #FF3366;
            color: white;
            transform: scale(1.05);
        }

        .reseñas-container {
            margin-top: 40px;
            animation: fadeIn 1s ease-in-out;
        }

        .reseña-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .reseña-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .reseña-card h3 {
            font-size: 1.5rem;
            color: #0F2027;
            margin-bottom: 10px;
        }

        .reseña-card p {
            font-size: 1.2rem;
            color: #666;
            margin: 5px 0;
        }

        footer {
            text-align: center;
            padding: 20px;
            background: #0F2027;
            color: white;
            margin-top: 170px;
        }

        footer a {
            color: #F9A826;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <!-- Navegación -->
    <nav>
        <div class="nav-left">
            <a href="Principal.php">
                <img src="Images/logo.png" alt="Logo"> <!-- Ajusta la ruta al logo -->
            </a>
        </div>

        <div class="nav-links">
            <a href="empresa.php">Empresa</a>
            <a href="oficinas.php">Oficinas</a>
            <a href="nuestrosbuses.php">Nuestros Buses</a>
            <a href="incidentes.php">Reportar Incidente</a>
        </div>
        <div class="nav-left"></div>
        
    </nav>

    <!-- Contenido principal -->
    <main>
        <h1>Reseñas</h1>
        <!-- Formulario para enviar reseña -->
        <form action="../Controller/CReseña.php" method="POST">
            <input type="hidden" id="fecha_reseña_cliente" name="fecha_reseña_cliente">
            <div class="form-group">
                <label for="rut_cliente">RUT del Cliente:</label>
                <input type="text" id="rut_cliente" name="rut_cliente" placeholder="Ejemplo: 12.345.678-9" required>
            </div>
            <div class="form-group">
                <label for="detalle_reseña_cliente">Tu Reseña:</label>
                <textarea id="detalle_reseña_cliente" name="detalle_reseña_cliente" placeholder="Escribe aquí tu experiencia..." required></textarea>
            </div>
            <button type="submit">Enviar Reseña</button>
        </form>

        <!-- Lista de reseñas -->
        <div class="reseñas-container">

        </div>
    </main>
    
    <!-- Pie de página -->
    <footer>
        <p>&copy; 2024 C&C Turismo y Viajes. Todos los derechos reservados.</p>
    </footer>

    <!-- Scripts -->
    <script>
        // Función para formatear el RUT mientras el usuario escribe
        document.getElementById('rut_cliente').addEventListener('input', function () {
            let rut = this.value.replace(/\D/g, ''); // Eliminar todo lo que no sea número
            let formattedRut = '';

            // Agregar puntos y guión según el formato del RUT chileno
            if (rut.length > 1) {
                formattedRut = rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + rut.slice(-1);
            } else {
                formattedRut = rut;
            }

            this.value = formattedRut; // Asignar el valor formateado al campo
        });

        // Función para validar el RUT chileno
        function validarRut(rut) {
            rut = rut.replace(/\./g, '').replace('-', ''); // Eliminar puntos y guión
            const cuerpo = rut.slice(0, -1);
            const dv = rut.slice(-1).toUpperCase();

            let suma = 0;
            let multiplo = 2;

            // Calcular suma del RUT
            for (let i = cuerpo.length - 1; i >= 0; i--) {
                suma += parseInt(cuerpo.charAt(i)) * multiplo;
                multiplo = multiplo === 7 ? 2 : multiplo + 1;
            }

            const dvEsperado = 11 - (suma % 11);
            const dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

            return dv === dvFinal;
        }

        // Validar RUT al enviar el formulario
        document.querySelector('form').addEventListener('submit', function (e) {
            const rutInput = document.getElementById('rut_cliente').value;
            if (!validarRut(rutInput)) {
                e.preventDefault(); // Evitar envío del formulario
                alert('El RUT ingresado no es válido o no esta registrado. Por favor, corrígelo.');
            }
        });

        // Establecer la fecha actual en el campo de fecha oculto
        document.addEventListener('DOMContentLoaded', function () {
            const fechaInput = document.getElementById('fecha_reseña_cliente');
            const today = new Date();
            const formattedDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
            fechaInput.value = formattedDate;
        });
    </script>
</body>
</html>
