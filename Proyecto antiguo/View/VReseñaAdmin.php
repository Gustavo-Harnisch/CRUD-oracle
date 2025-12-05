<?php
namespace App\View;
class VReseñaAdmin {
    public function render($data = []) {
        $reseñas = $data['reseñas'] ?? [];
        ?>
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de Reseñas - C&C Turismo y Viajes</title>
            <style>
                body {
                    background: url('images/5.jpg'); 
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
                    margin-right: auto; 
                }

                .nav-left img {
                    height: 60px;
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

                footer a:hover {
                    text-decoration: underline;
                }
                </style>
        </head>
        <body>
        <nav>
            <div class="nav-left">
                    <a href="Principal.php">
                        <img src="Images/logo.png" alt="Logo"> 
                    </a>
            </div>
            <div class="nav-links">
                <a href="principalAdmin.php" class="active">Inicio</a>
                <a href="indedxIncidenteAdmin.php">Incidentes</a>
                <a href="oficinas.html">Tickets Vendidos</a>
                <a href="mantenimientoAdmin.php">Mantenimientos</a>
            </div>
            <div class="nav-right"></div>
        </nav>
            <header>
                <h1>Lista de Reseñas</h1>
            </header>
            <main>
                <?php if (empty($reseñas)): ?>
                    <p>No hay reseñas disponibles.</p>
                <?php else: ?>
                    <?php foreach ($reseñas as $resena): ?>
                        <div class="reseña-card">
                            <p><strong>Fecha:</strong> <?php echo htmlspecialchars($resena['fecha_resena_cliente']); ?></p>
                            <p><strong>RUT del Cliente:</strong> <?php echo htmlspecialchars($resena['rut_cliente']); ?></p>
                            <p><strong>Reseña:</strong> <?php echo htmlspecialchars($resena['detalle_resena_cliente']); ?></p>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </main>
        </body>
        </html>
        <?php
    }
}
?>