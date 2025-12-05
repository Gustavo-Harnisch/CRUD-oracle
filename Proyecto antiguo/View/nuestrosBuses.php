<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buses - C&C Turismo y Viajes</title>
    <style>
        body {
                background-image: url('images/7.jpg'); /* Cambiar por imagen real */
                background-size: cover;
                background-position: left -20px; /* Corre la imagen un poco a la izquierda */
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
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

        header {
            background-size: cover;
            background-position: center;
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            margin-top: -100px;
        }

        header h1 {
            text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
        }

        main {
            padding: 20px;
            max-width: 1200px;
            margin: auto;
        }

        h2 {
            text-align: center;
            color: #0F2027;
            margin-bottom: 20px;
        }

        .oficina-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 30px;
            margin-top: 30px;;
        }

        .oficina-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 300px;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .oficina-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }

        .oficina-card h3 {
            color: #F9A826;
            font-size: 1.3rem;
        }

        .oficina-card p {
            color: #666;
            font-size: 1rem;
            margin: 5px 0;
        }

        footer {
            text-align: center;
            padding: 15px;
            background: #0F2027;
            color: white;
            margin-top: 150px;
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
            <a href="empresa.php">Empresas</a>
            <a href="reseña.php">Reseñas</a>
            <a href="incidentes.php">Reportar Incidente</a>
        </div>
        <div class="nav-left"></div>
        
    </nav>

    <!-- Encabezado -->
    <header>
        <h1 style="font-weight: bold; color: white;">Nuestros Buses</h1>
    </header>

    <!-- Contenido Principal -->
    <main>
        <div class="oficina-container">
            <!-- Tarjeta de oficina -->
            <div class="oficina-card">
                <img src="images/bus1.jpg" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

            <div class="oficina-card">
                <img src="images/bus6.jpg" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

            <div class="oficina-card">
                <img src="images/bus3.jpg" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

            <div class="oficina-card">
                <img src="images/bus4.jpg" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

            <div class="oficina-card">
                <img src="images/bus5.jpg" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

            <div class="oficina-card">
                <img src="images/bus2.jpg" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

            <div class="oficina-card">
                <img src="images/bus7.jpg" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

            <div class="oficina-card">
                <img src="images/bus8.JPG" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

            <div class="oficina-card">
                <img src="images/bus9.jpg" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

            <div class="oficina-card">
                <img src="images/bus10.jpg" alt="Oficina Santiago" style="width: 100%; height: auto; border-radius: 10px 10px 0 0;">
            </div>

         
        </div>
    </main>

    <!-- Pie de página -->
    <footer>
        <p>&copy; 2024 C&C Turismo y Viajes. Todos los derechos reservados.</p>
    </footer>
</body>
</html>