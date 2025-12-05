
<!DOCTYPE html>

<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Empresa - C&C Turismo y Viajes</title>
    <style>
    body {
        margin: 0;
        font-family: Arial, sans-serif;
        color: #333;
        background: url(images/4.jpg) no-repeat center center fixed; /* Centrado y fijo */
        background-size: cover; /* Hace que la imagen cubra todo el fondo */
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
        }

        h1 {
            text-align: center;
            font-size: 2.5rem;
            color: #0F2027;
            margin-bottom: 30px;
        }

        .section {
            background: white;
            border-radius: 15px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin-bottom: 40px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .section:hover {
            transform: translateY(-10px);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
        }

        .section img {
            width: 80px;
            margin-bottom: 20px;
        }

        .flex-container {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        .flex-container2 {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }

        .card {
            flex: 1;
            max-width: 30%;
            background: white;
            border-radius: 15px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            padding: 30px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
        }

        .card img {
            width: 80px;
            margin-bottom: 20px;
        }

        .card h2 {
            font-size: 1.8rem;
            margin-bottom: 15px;
            color: #F9A826;
        }

        .card p, .card ul {
            font-size: 1rem;
            color: #666;
            line-height: 1.8;
            text-align: justify;
        }

        .card ul {
            list-style: none;
            padding: 0;
        }

        .card ul li {
            margin: 10px 0;
            text-align: left;
        }

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
            <a href="oficinas.php">Oficinas</a>
            <a href="nuestrosbuses.php">Nuestros Buses</a>
            <a href="reseña.php">Reseñas</a>
            <a href="incidentes.php">Reportar Incidente</a>
        </div>
        <div class="nav-left"></div>
        
    </nav>

    <!-- Contenido principal -->
    <main>
        <h1 style="color: white; font-weight: bold;">
        <div class="flex-container2"> 
            <div class="card">
                <div style="text-align: center;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2201/2201580.png" alt="Ícono de Historia">
                    <h2>Nuestra Historia</h2>
                </div>
                <p>
                Nuestra historia comenzó como una pequeña empresa dedicada al arriendo de transporte, conectando Talca con localidades cercanas. Con el tiempo, impulsados por nuestra pasión por el servicio al cliente y un espíritu innovador, surgió la idea de expandir nuestras operaciones. Este compromiso nos permitió crecer y ofrecer rutas a diversas regiones de Chile, consolidándonos como una opción confiable y accesible para quienes buscan soluciones de transporte de calidad.
                </p>
            </div>

            <div class="card">
                <div style="text-align: center;">
                    <img src="https://img.icons8.com/color/96/handshake.png" alt="Ícono de Compromiso">
                    <h2>Nuestro Compromiso</h2>
                </div>
                <p>
                    Nos comprometemos a ofrecer un servicio de transporte seguro, cómodo y accesible para todos. Creemos en la importancia de crear conexiones entre las personas, ya sea para trabajo, turismo o reencuentros familiares.
                </p>
            </div>
        </div>
        <!-- Historia -->


        <!-- Misión, Visión y Planes -->
        <div class="flex-container">
            <!-- Misión -->
            <div class="card">
                <img src="https://img.icons8.com/color/96/goal.png" alt="Ícono de Misión">
                <h2>Misión</h2>
                <p>Conectar personas y destinos ofreciendo servicios de transporte de alta calidad, con un enfoque en la seguridad, la comodidad y la puntualidad, contribuyendo al desarrollo social y económico de las comunidades a las que servimos.</p>
            </div>

            <!-- Visión -->
            <div class="card">
                <img src="https://img.icons8.com/color/96/vision.png" alt="Ícono de Visión">
                <h2>Visión</h2>
                <center> <p>Ser la empresa líder en transporte terrestre en Chile, reconocida por nuestra innovación, nuestro impacto positivo en las comunidades y nuestra contribución al medio ambiente mediante prácticas sostenibles.</p></center> 
            </div>

            <!-- Planes -->
            <div class="card">
                <img src="https://cdn-icons-png.flaticon.com/512/1373/1373060.png" alt="Ícono de Planes">
                <h2>Nuestros Planes</h2>
                <ul>
                    <li>- Implementar rutas propias con nuestros servicios de transporte..</li>
                    <li>- Ampliar destinos conectando más regiones de Chile..</li>
                    <li>- Garantizar viajes seguros y confortables. </li>
                </ul>
            </div>
        </div>


        <!-- Compromiso -->
    </main>

    <!-- Pie de página -->
    <footer>
        <p>&copy; 2024 C&C Turismo y Viajes. Todos los derechos reservados.</p>
    </footer>
</body>
</html>