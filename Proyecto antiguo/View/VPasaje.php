<?php
namespace App\View;

class VPasaje {
    // Método para renderizar la página con los datos de origen y destino
    public function render(array $data) {
        $origenes = $data['origenes'] ?? [];
        $destinos = $data['destinos'] ?? [];

        ?>
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Compra de Pasaje - C&C Turismo y Viajes</title>
            <style>
                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                    color: #333;
                    background: url('images/2.jpg') no-repeat center center fixed;
                    background-size: cover;
                }
                nav {
                    background: linear-gradient(90deg, #0F2027, #203A43, #2C5364);
                    padding: 5px 30px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-bottom: 3px solid #F9A826;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
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
                    transition: color 0.3s, transform 0.2s;
                    position: relative;
                }
                nav a:hover {
                    color: #FF3366;
                    transform: scale(1.1);
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
                    width: 100%;
                }
                .nav-right {
                    margin-left: auto;
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
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                }
                .nav-right .btn-entrar:hover {
                    background: #FF3366;
                    color: white;
                    transform: scale(1.1);
                }
                main {
                    padding: 40px 30px;
                    max-width: 600px;
                    margin: auto;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                    margin-top: 120px;
                }
                h1 {
                    text-align: center;
                    font-size: 2.5rem;
                    color: #0F2027;
                    margin-bottom: 20px;
                }
                form {
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: none;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    width: 100%;
                    background-color: #F9A826;
                    color: #0F2027;
                    padding: 10px 20px;
                    font-size: 1rem;
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
                footer {
                    text-align: center;
                    padding: 20px;
                    background: rgba(15, 32, 39, 0.9);
                    color: #F1F1F1;
                    margin-top: 140px;
                }
                footer a {
                    color: #F9A826;
                    text-decoration: none;
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
                    <a href="Principal.php" class="active">Inicio</a>
                    <a href="Empresa.php">Empresa</a>
                    <a href="oficinas.php">Oficinas</a>
                    <a href="nuestrosbuses.php">Nuestros Buses</a>
                    <a href="reseña.php">Reseñas</a>
                    <a href="incidentes.php">Reportar Incidente</a>
                </div>
                <div class="nav-left"></div>

            </nav>

            <main>
                <h1><strong>Compra tu pasaje</strong></h1>
                <!-- Cambiar action y method -->
                <form id="formularioPasaje" action="indexHorario.php" method="GET">
                    <div class="form-group">
                        <label for="origen">Origen</label>
                        <select id="origen" name="origen" required>
                            <option value="">Selecciona una ruta</option>
                            <?php foreach ($origenes as $origen): ?>
                                <option value="<?php echo htmlspecialchars($origen); ?>">
                                    <?php echo htmlspecialchars($origen); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="destino">Destino</label>
                        <select id="destino" name="destino" required>
                            <option value="">Selecciona un destino</option>
                            <?php foreach ($destinos as $destino): ?>
                                <option value="<?php echo htmlspecialchars($destino); ?>">
                                    <?php echo htmlspecialchars($destino); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="fecha_viaje">Fecha del Viaje:</label>
                        <input type="date" id="fecha_viaje" name="fecha_viaje" required>
                    </div>
                    <button type="submit">Buscar Pasaje</button>
                </form>
            </main>

            <script>
                /* (El script de validación permanece igual) */
            </script>

            <footer>
                <p>&copy; 2024 C&C Turismo y Viajes. Todos los derechos reservados.</p>
            </footer>
        </body>
        </html>
        <?php
    }
}
?>