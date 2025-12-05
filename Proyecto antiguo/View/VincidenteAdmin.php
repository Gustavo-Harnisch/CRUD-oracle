<?php
namespace App\View;

class VincidenteAdmin {
    public function render(array $data) {
        $incidentes = $data['incidentes'] ?? [];
        if (!is_array($incidentes)) {
            echo '<p>No hay incidentes disponibles.</p>';
            return;
        }
        ?>
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de Incidentes - C&C Turismo y Viajes</title>
            <style>
                body {
                    background: url(images/6.JPG);
                    background-size: cover;
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f7f7f7;
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
                    max-width: 800px;
                    margin: 30px auto;
                    padding: 20px;
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }

                h1 {
                    text-align: center;
                    font-size: 2rem;
                    margin-bottom: 20px;
                    color: #0F2027;
                }

                .card {
                    background-color: transparent;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    margin-bottom: 20px;
                    padding: 20px;
                    transition: transform 0.2s;
                }

                .card:hover {
                    transform: scale(1.02);
                }

                .card h2 {
                    margin-top: 0;
                    color: #0F2027;
                }

                .card p {
                    margin: 5px 0;
                }

                footer {
                    text-align: center;
                    padding: 15px;
                    background-color: #0F2027;
                    color: #F1F1F1;
                    margin-top: 250px;
                }

                footer a {
                    color: #F9A826;
                    text-decoration: none;
                }

                footer a:hover {
                    text-decoration: underline;
                }
                </style>
    </head>
    <body>
        <nav>
            <div class="nav-left">
                <a href="Principal.php">
                    <img src="Images/logo.png" alt="Logo"> <!-- Ajusta la ruta al logo -->
                </a>
            </div>
            <div class="nav-links">
                <a href="indexReseñasAdmin.php">Reseñas Recibidas</a>
                <a href="oficinas.html">Tickets Vendidos</a>
                <a href="reseña.html">Mantenimientos</a>
            </div>
            <div class="nav-right"></div>
        </nav>
        <header>
            <h1 style="color: white;">Lista de Incidentes</h1>
        </header>
        <main>
            <?php foreach ($incidentes as $incidente): ?>
                <div class="card">
                    <h2>Incidente: <?php echo htmlspecialchars($incidente['id_incidente'] ?? 'No definido'); ?></h2>
                    <p><strong>Patente del Bus:</strong> <?php echo htmlspecialchars($incidente['patente_bus'] ?? 'No definida'); ?></p>
                    <p><strong>Descripción:</strong> <?php echo htmlspecialchars($incidente['descripcion_incidente'] ?? 'No definida'); ?></p>
                    <p><strong>Fecha:</strong> <?php echo htmlspecialchars($incidente['fecha_incidente'] ?? 'No definida'); ?></p>
                    <p><strong>Gravedad:</strong> <?php echo htmlspecialchars($incidente['gravedad_incidente'] ?? 'No definida'); ?></p>
                </div>
            <?php endforeach; ?>
        </main>
        <footer>
            <p>&copy; 2024 C&C Turismo y Viajes. Todos los derechos reservados</p>
        </footer>
    </body>
    </html>
    <?php
}
}
?>