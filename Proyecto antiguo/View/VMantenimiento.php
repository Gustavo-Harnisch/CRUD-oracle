<?php

namespace App\View;

class VMantenimiento
{
    public function render($data = [])
    {
        $mantenimientos = $data['mantenimientos'] ?? [];
        $fecha_sistema = $data['fecha_sistema'] ?? '';
        ?>

        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Gestión de Mantenimientos</title>
            <style>
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
                    padding: 15px 30px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-bottom: 3px solid #F9A826;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Sombra elegante */
                    position: sticky;
                    top: 0; /* Fija la navegación al hacer scroll */
                    z-index: 1000; /* Asegura que esté por encima de otros elementos */
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

                .mantenimientos-container {
                    margin-top: 40px;
                    animation: fadeIn 1s ease-in-out;
                }

                .mantenimiento-card {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    margin-bottom: 20px;
                    transition: transform 0.3s, box-shadow 0.3s;
                }

                .mantenimiento-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                }

                .mantenimiento-card h3 {
                    font-size: 1.5rem;
                    color: #0F2027;
                    margin-bottom: 10px;
                }

                .mantenimiento-card p {
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

                footer a:hover {
                    text-decoration: underline;
                }

                /* Estilos del formulario */
                form {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                    margin: 40px auto;
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

                .form-group input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 1rem;
                }

                button[type="submit"] {
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

                button[type="submit"]:hover {
                    background-color: #FF3366;
                    color: white;
                    transform: scale(1.05);
                }
            </style>
        </head>
        <body>
            <nav>
                <div class="nav-links">
                    <a href="principalAdmin.php" class="active">Inicio</a>
                    <a href="incidenteAdmin.php">Incidentes</a>
                    <a href="oficinas.html">Tickets Vendidos</a>
                    <a href="mantenimientoAdmin.php">Mantenimientos</a>
                </div>
            </nav>
            <header>
                <h1>Gestión de Mantenimientos</h1>
            </header>

            <main>
                <!-- Formulario para agregar mantenimiento -->
                <form method="POST" action="../Controller/CMantenimiento.php">
                    <div class="form-group">
                        <label for="patente_bus">Patente del Bus:</label>
                        <input type="text" id="patente_bus" name="patente_bus" required>
                    </div>
                    <div class="form-group">
                        <label for="descripcion_mantenimiento">Descripción del Mantenimiento:</label>
                        <input type="text" id="descripcion_mantenimiento" name="descripcion_mantenimiento" required>
                    </div>
                    <button type="submit">Agregar Mantenimiento</button>
                </form>

                <div class="mantenimientos-container">
                    <h2 style="color: white;">Mantenimientos Registrados</h2>
                    <?php if (empty($mantenimientos)): ?>
                        <p>No hay mantenimientos registrados.</p>
                    <?php else: ?>
                        <?php foreach ($mantenimientos as $mantenimiento): ?>
                            <div class="mantenimiento-card">
                                <h3>Fecha: <?php echo htmlspecialchars($mantenimiento['FECHA_MANTENIMIENTO'] ?? 'N/A'); ?></h3>
                                <p><strong>ID del Mantenimiento:</strong> <?php echo htmlspecialchars($mantenimiento['ID_MANTENIMIENTO'] ?? 'N/A'); ?></p>
                                <p><strong>Patente del Bus:</strong> <?php echo htmlspecialchars($mantenimiento['PATENTE_BUS'] ?? 'N/A'); ?></p>
                                <p><strong>Descripción:</strong> <?php echo htmlspecialchars($mantenimiento['DESCRIPCION_MANTENIMIENTO'] ?? 'N/A'); ?></p>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </main>

            <footer>
                <p>&copy; 2024 C&C Turismo y Viajes. Todos los derechos reservados</p>
            </footer>
        </body>
        </html>

        <?php
    }
}