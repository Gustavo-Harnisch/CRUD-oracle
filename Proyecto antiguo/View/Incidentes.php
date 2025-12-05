
<?php
require_once '../Controller/CIncidente.php';
class IncidenteView {
    public function render() {
        ?>
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registro de Incidente - C&C Viajes</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
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
                main {
                    max-width: 600px;
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
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 10px;
                    font-size: 1rem;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    box-sizing: border-box;
                }
                .form-group textarea {
                    resize: none;
                    height: 100px;
                }
                button {
                    width: 100%;
                    padding: 10px;
                    font-size: 1rem;
                    font-weight: bold;
                    background-color: #F9A826;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                button:hover {
                    background-color: #FF3366;
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
            <a href="empresa.php">Empresa</a>
            <a href="oficinas.php">Oficinas</a>
            <a href="nuestrosbuses.php">Nuestros Buses</a>
            <a href="reseña.php">Reseñas</a>
        </div>
        <div class="nav-left"></div>
        
    </nav>
            <header>
                <h1 style="color: white;">Registra un Incidente</h1>
            </header>
            <main>
                <form action="../Controller/CIncidente.php" method="POST">
                    <input type="hidden" name="action" value="save">
                    <div class="form-group">
                        <label for="patente">Patente del Bus:</label>
                        <input type="text" id="patente" name="patente_bus" placeholder="Ingrese la patente del bus" required>
                    </div>
                    <div class="form-group">
                        <label for="descripcion">Descripción del Incidente:</label>
                        <textarea id="descripcion" name="descripcion_incidente" placeholder="Describa el incidente con detalles" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="fecha">Fecha del Incidente:</label>
                        <input type="date" id="fecha" name="fecha_incidente" required>
                    </div>
                    <div class="form-group">
                        <label for="gravedad">Gravedad del Incidente:</label>
                        <select id="gravedad" name="gravedad_incidente" required>
                            <option value="">Seleccione una opción</option>
                            <option value="leve">Leve</option>
                            <option value="moderado">Moderado</option>
                            <option value="grave">Grave</option>
                            <option value="muy grave">Muy Grave</option>
                        </select>
                    </div>
                    <button type="submit">Registrar Incidente</button>
                </form>
            </main>
            <footer>
                <p>&copy; 2024 C&C Turismo y Viajes. Todos los derechos reservados</p>
            </footer>
        </body>
        </html>
        <?php
    }
}

$view = new IncidenteView();
$view->render();
?>