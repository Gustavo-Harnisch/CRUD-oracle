<?php
require_once '../Models/ConexionBase.php';

use App\Models\ConexionBase;

function getRegiones() {
    $conexion = new ConexionBase();
    $db = $conexion->connect();

    $query = "SELECT ID_REGION, NOMBRE_REGION FROM MFJCLPBC_REGION";
    $stmt = $db->prepare($query);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

$regiones = getRegiones();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Usuario - C&C Turismo y Viajes</title>
    <style>
        body {
            background: url(images/9.JPG);
            background-size: cover;
            margin: 0;
            font-family: 'Arial', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #333;
            overflow: hidden;
        }
        .form-box {
            background: #FFF;
            padding: 30px 40px;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 600px;
            position: relative;
            transform: scale(0.9);
            animation: popIn 0.6s ease forwards;
        }
        @keyframes popIn {
            0% {
                transform: scale(0.5);
                opacity: 0;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        .form-box h2 {
            margin: 0 0 20px;
            text-align: center;
            color: #0F2027;
            animation: fadeIn 1s ease;
        }
        @keyframes fadeIn {
            0% {
                opacity: 0;
                transform: translateY(-20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .form-box form {
            display: flex;
            flex-direction: column;
        }
        .form-box input,
        .form-box select {
            padding: 12px 15px;
            margin: 10px 0;
            border: 1px solid #CCC;
            border-radius: 5px;
            font-size: 1rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        .form-box input:focus,
        .form-box select:focus {
            outline: none;
            border-color: #F9A826;
            box-shadow: 0 0 8px rgba(249, 168, 38, 0.5);
            transform: scale(1.02);
        }
        .form-box button {
            padding: 12px;
            margin-top: 15px;
            background: linear-gradient(135deg, #FF7E5F, #F9A826);
            color: #FFF;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
        }
        .form-box button:hover {
            background: linear-gradient(135deg, #FF3366, #F9A826);
            transform: scale(1.05);
        }
        .form-box .toggle-link {
            text-align: center;
            margin-top: 20px;
            animation: fadeIn 1s ease;
        }
        .form-box .toggle-link a {
            color: #F9A826;
            text-decoration: none;
            font-weight: bold;
            transition: color 0.3s;
        }
        .form-box .toggle-link a:hover {
            color: #FF3366;
        }
        .back-link {
            display: block;
            text-align: center;
            margin-bottom: 20px;
            color: #F9A826;
            text-decoration: none;
            font-weight: bold;
            font-size: 1rem;
            animation: fadeIn 1s ease;
        }
        .back-link:hover {
            color: #FF3366;
        }
        .error {
            color: red;
            text-align: center;
            margin-top: 10px;
        }
    </style>
    <script>
        function loadCities(regionId) {
            fetch('load_cities.php?id_region=' + regionId)
                .then(response => response.json())
                .then(data => {
                    const citySelect = document.getElementById('city');
                    citySelect.innerHTML = '<option value="">Selecciona una ciudad</option>';
                    data.cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city.ID_CIUDAD;
                        option.textContent = city.NOMBRE_CIUDAD;
                        citySelect.appendChild(option);
                    });
                })
                .catch(error => console.error('Error:', error));
        }

        // Formatear el RUT mientras el usuario escribe
        document.addEventListener('DOMContentLoaded', function() {
            const rutInput = document.getElementById('rut');
            rutInput.addEventListener('input', function() {
                let rut = this.value.replace(/\D/g, '');
                let formattedRut = '';

                if (rut.length > 1) {
                    formattedRut = rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + rut.slice(-1);
                } else {
                    formattedRut = rut;
                }

                this.value = formattedRut;
            });
        });
    </script>
</head>
<body>
    <div class="form-box">
        <a href="Principal.php" class="back-link">Volver al inicio</a>
        <h2>Crear Cuenta</h2>
        <form action="process_register.php" method="POST">
            <label for="rut">RUT:</label>
            <input type="text" id="rut" name="rut" placeholder="Ejemplo: 12.345.678-9" required>
            
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" placeholder="Ingresa tu contraseña" required>
            
            <label for="first_name">Nombre:</label>
            <input type="text" id="first_name" name="first_name" placeholder="Ingresa tu nombre" required>
            
            <label for="last_name_p">Apellido Paterno:</label>
            <input type="text" id="last_name_p" name="last_name_p" placeholder="Ingresa tu apellido paterno" required>
            
            <label for="last_name_m">Apellido Materno:</label>
            <input type="text" id="last_name_m" name="last_name_m" placeholder="Ingresa tu apellido materno" required>
            
            <label for="phone">Teléfono:</label>
            <input type="text" id="phone" name="phone" placeholder="Ingresa tu número" required>
            
            <label for="emergency_phone">Teléfono de Emergencia:</label>
            <input type="text" id="emergency_phone" name="emergency_phone" placeholder="Teléfono del contacto de emergencia" required>
            
            <label for="region">Región:</label>
            <select id="region" name="region" required onchange="loadCities(this.value)">
                <option value="">Selecciona una región</option>
                <?php foreach ($regiones as $region): ?>
                    <option value="<?php echo htmlspecialchars($region['ID_REGION']); ?>">
                        <?php echo htmlspecialchars($region['NOMBRE_REGION']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
            
            <label for="city">Ciudad:</label>
            <select id="city" name="city" required>
                <option value="">Selecciona una ciudad</option>
            </select>
            
            <button type="submit">Registrar</button>
        </form>
        <div class="toggle-link">
            <p>¿Ya tienes cuenta? <a href="login.php">Inicia sesión aquí</a></p>
        </div>
        <div class="error">
            <!-- Mensajes de error se mostrarán aquí -->
        </div>
    </div>
</body>
</html>