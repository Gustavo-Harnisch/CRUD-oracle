<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="C&C Turismo y Viajes: Conectando destinos con comodidad y confianza. Compra tus pasajes y descubre más sobre nuestros servicios.">
    <meta name="keywords" content="buses, transporte, pasajes, Talca, viajes, servicios">
    <meta name="author" content="">
    <title>C&C Turismo y Viajes</title>
    <style>
        /* Estilos generales */
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f7f7f7;
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

        /* Encabezado */
        header {
            height: 100vh;
            background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('images/1.jpg'); /* Cambia esta ruta */
            background-size: cover;
            background-position: center;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
        }

        header .content h1 {
            font-size: 4rem;
            margin: 0;
            text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
        }

        header .content p {
            font-size: 1.5rem;
            height: 30px;
            margin: 30px 10px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
        }

        header .btn {
            padding: 15px 30px;
            font-size: 1.2rem;
            background-color: #F9A826;
            color: #0F2027;
            border: none;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
        }

        header .btn:hover {
            background: #FF3366;
            color: white;
            transform: scale(1.05);
        }

        /* Secciones */
        main {
            padding: 40px 20px;
            max-width: 1200px;
            margin: auto;
        }

        section {
            margin: 40px 0;
        }

        section h2 {
            color: #0F2027;
            font-size: 2.5rem;
            text-align: center;
            margin-bottom: 20px;
        }

        .card-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
        }

        .card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 300px;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }

        .card h3 {
            font-size: 1.5rem;
            color: #F9A826;
            margin-bottom: 10px;
        }

        .card p {
            font-size: 1rem;
            line-height: 1.6;
            color: #666;
        }

        /* Contacto */
        #contacto {
            margin-top: 60px;
            text-align: center;
        }

        .contact-container {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .contact-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 280px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .contact-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }

        .contact-card img {
            width: 50px;
            margin-bottom: 15px;
        }

        .contact-card h3 {
            font-size: 1.2rem;
            color: #F9A826;
            margin-bottom: 10px;
        }

        .contact-card p {
            font-size: 1rem;
            color: #666;
            margin: 0;
        }

        .contact-card a {
            text-decoration: none;
            color: #0F2027;
            font-weight: bold;
            transition: color 0.3s;
        }

        .contact-card a:hover {
            color: #F9A826;
        }

        /* Pie de página */
        footer {
            text-align: center;
            padding: 20px;
            background: #0F2027;
            color: #F1F1F1;
        }

        footer a {
            color: #F9A826;
            text-decoration: none;
        }
        /* Modal */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none; /* Ocultar por defecto */
            background-color: rgba(0, 0, 0, 0.6); /* Fondo semitransparente */
            backdrop-filter: blur(8px); /* Efecto desenfoque */
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .modal.active {
            display: flex; /* Mostrar modal */
        }

        .modal-content {
            background: #fff;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            text-align: center;
            position: relative;
        }

        .close-btn {
            background: transparent;
            border: none;
            color: #333;
            font-size: 1.5rem;
            position: absolute;
            top: 10px;
            right: 15px;
            cursor: pointer;
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
    <div class="nav-links" style="position: sticky;">
        <a href="indexIncidenteAdmin.php">Incidentes</a>
        <a href="indexReseñasAdmin.php">Reseñas Recibidas</a>
        <a href="incidente.html">Tickets Vendidos</a>
        <a href="indexmantenimiento.php">Mantenimientos</a>
    </div>
    <div class="nav-right">
        <?php if (isset($_SESSION['admin'])): ?>
            <span style="color: white;">Bienvenido Administrador</span>
            <a href="logout.php" class="btn-entrar">Cerrar Sesión</a>
        <?php else: ?>
            <a href="login.html" class="btn-entrar">Iniciar Sesión</a>
        <?php endif; ?>
    </div>
</nav>


    <!-- Encabezado -->
    <header id="inicio">
        <div class="content">
            <h1>CONECTANDO DESTINOS</h1>
            <p>Tu viaje comienza aquí</p>
            <a href="index.php" class="btn">Comprar Pasajes</a>
        </div>
    </header>

    <!-- Contenido principal -->
    <main>
        <section id="proyectos">
            <h2>Proyectos</h2>
            <div class="card-container">
                <div class="card">
                    <h3>Modernización</h3>
                    <p>Flota de buses equipados con tecnología de punta.</p>
                </div>
                <div class="card">
                    <h3>Rutas Expandidas</h3>
                    <p>Nuevos destinos en el norte y sur de Chile.</p>
                </div>
                <div class="card">
                    <h3>Digitalización</h3>
                    <p>Compra de pasajes online y app móvil.</p>
                </div>
            </div>
        </section>

        <section id="servicios">
            <h2>Servicios</h2>
            <div class="card-container">
                <div class="card">
                    <h3>Rutas Interurbanas</h3>
                    <p>Conectamos las principales ciudades de Chile.</p>
                </div>
                <div class="card">
                    <h3>Comodidad</h3>
                    <p>Asientos reclinables, aire acondicionado y Wi-Fi.</p>
                </div>
                <div class="card">
                    <h3>Encomiendas</h3>
                    <p>Transporte seguro para tus paquetes importantes.</p>
                </div>
            </div>
        </section>

        <section id="contacto">
            <h2>Contacto</h2>
            <div class="contact-container">
                <div class="contact-card">
                    <img src="https://img.icons8.com/material-outlined/48/000000/email.png" alt="Correo">
                    <h3>Correo Electrónico</h3>
                    <p><a href="mailto:contacto@tpl.cl">gabo.baterista1@gmail.com</a></p>
                </div>
                <div class="contact-card">
                    <img src="https://img.icons8.com/material-outlined/48/000000/phone.png" alt="Teléfono">
                    <h3>Teléfono</h3>
                    <p><a href="tel:+56712211010">+569 2220 8646</a></p>
                </div>
                <div class="contact-card">
                    <img src="https://img.icons8.com/material-outlined/48/000000/clock.png" alt="Horario">
                    <h3>Horario de Atención</h3>
                    <p>Lunes a Viernes: 08:00 - 20:00</p>
                    <p>Sábados: 09:00 - 14:00</p>
                </div>
            </div>
        </section>
    </main>

    <!-- Pie de página -->
    <footer>
        <p>&copy; 2024 C&C Turismo y Viajes. Todos los derechos reservados</p>
    </footer>
</body>
</html>
