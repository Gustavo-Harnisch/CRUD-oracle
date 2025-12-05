<?php
namespace App\View;

class VHorario {
    // Método para renderizar la página con los datos de origen y destino
    public function render($data = []) {
        $horarios = $data['horarios'] ?? [];
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
                    background: url('2.jpg') no-repeat center center fixed;
                    background-size: cover;
                }
                nav {
                    background: linear-gradient(90deg, #0F2027, #203A43, #2C5364);
                    padding: 15px 30px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-bottom: 3px solid #F9A826;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
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
            <!-- Navegación -->
            <nav>
                <div class="nav-links">
                    <a href="Principal.php" class="active">Inicio</a>
                    <a href="Empresa.php">Empresa</a>
                    <a href="oficinas.php">Oficinas</a>
                    <a href="nuestrosbuses.php">Nuestros Buses</a>
                    <a href="reseña.php">Reseñas</a>
                    <a href="incidentes.php">Reportar Incidente</a>
                </div>
            </nav>

            <!-- Contenido principal -->
            <main>
            <div class="mantenimientos-container">
    <form action="indexAsiento.php" method="POST"> <!-- Cambia la acción por el archivo que procesará los datos -->
        <h3>Seleccione el Horario:</h3>
        <select name="horario_seleccionado" id="horario_seleccionado">
            <?php foreach ($horarios as $horario): ?>
                <option value="<?php echo htmlspecialchars($horario['ID_HORARIO']); ?>">
                    Horario: <?php echo htmlspecialchars($horario['ID_HORARIO']); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <button type="submit">Enviar</button>
    </form>
</div>
            </main>

            <!-- Pie de página -->
            <footer>
                <p>&copy; 2024 C&C Turismo y Viajes. Todos los derechos reservados.</p>
            </footer>
        </body>
        </html>
        <?php
    }
}
?>
