<?php

namespace App\View;

class VRegister
{
    public function render($data = [])
    {
        $regiones = $data['regiones'] ?? [];
        ?>
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="Formulario de registro Turismo y Viaje .">
            <title>Registro de Usuario - C&C Turismo y Viajes</title>
            <style>
                /* Estilos generales */
                body {
                    background: url(images/9.JPG), linear-gradient(to bottom, #0F2027, #203A43, #2C5364);
                    background-size: cover;
                    background-blend-mode: overlay;
                    font-family: Arial, sans-serif;
                    margin: 0;
                    color: #f7f7f7;
                }

                .container {
                    max-width: 900px;
                    margin: 50px auto;
                    padding: 30px;
                    background: #ffffff;
                    border-radius: 15px;
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
                    color: #333;
                }

                h1 {
                    text-align: center;
                    color: #0F2027;
                    margin-bottom: 20px;
                }

                form {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 40px;
                }

                .form-group {
                    flex: 1 1 calc(50% - 20px);
                    display: flex;
                    flex-direction: column;
                }

                .form-group.wide {
                    flex: 1 1 100%;
                }

                label {
                    font-weight: bold;
                    color: #0F2027;
                }

                input, select, textarea {
                    width: 100%;
                    padding: 10px;
                    margin-top: 5px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 1rem;
                }

                textarea {
                    resize: none;
                }

                .btn {
                    background-color: #F9A826;
                    color: #fff;
                    border: none;
                    padding: 15px 20px;
                    border-radius: 5px;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    text-align: center;
                    width: 100%;
                }

                .btn:hover {
                    background-color: #FF3366;
                }

                .back-link {
                    display: block;
                    text-align: center;
                    margin-bottom: 20px;
                    color: #F9A826;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: 1rem;
                }

                .back-link:hover {
                    color: #FF3366;
                }
            </style>
        </head>
        <body>
            <div class="bg-container">
                <div class="container">
                    <a href="Principal.php" class="back-link">Volver al inicio</a>
                    <h1>Crear Cuenta</h1>
                    <form action="../Controller/CRegister.php" method="POST">   
                        <div class="form-group">
                            <label for="rut">RUT</label>
                            <input type="text" id="rut" name="rut" placeholder="Ejemplo: 12.345.678-9" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input type="password" id="password" name="password" placeholder="Ingresa tu contraseña" required>
                        </div>

                        <div class="form-group">
                            <label for="first_name">Nombre</label>
                            <input type="text" id="first_name" name="first_name" placeholder="Ingresa tu nombre" required>
                        </div>

                        <div class="form-group">
                            <label for="last_name_p">Apellido Paterno</label>
                            <input type="text" id="last_name_p" name="last_name_p" placeholder="Ingresa tu apellido paterno" required>
                        </div>

                        <div class="form-group">
                            <label for="last_name_m">Apellido Materno</label>
                            <input type="text" id="last_name_m" name="last_name_m" placeholder="Ingresa tu apellido materno" required>
                        </div>

                        <div class="form-group">
                            <label for="phone">Teléfono</label>
                            <input type="text" id="phone" name="phone" placeholder="Ingresa tu número" required>
                        </div>

                        <div class="form-group">
                            <label for="emergency_phone">Teléfono de Emergencia</label>
                            <input type="text" id="emergency_phone" name="emergency_phone" placeholder="Teléfono del contacto de emergencia" required>
                        </div>

                        <div class="form-group">
                            <label for="region">Región</label>
                            <select id="region" name="region" required>
                            <option value="">Selecciona una región</option>
                            <?php 
                            foreach ($regiones as $region): ?>
                                <option value="<?= htmlspecialchars($region['id'], ENT_QUOTES, 'UTF-8') ?>">
                                <?= htmlspecialchars(mb_convert_encoding($region['name'], 'UTF-8', 'ISO-8859-1'), ENT_QUOTES, 'UTF-8') ?>

                                </option>
                            <?php endforeach; ?>
                            </select>


                        </div>

                        <div class="form-group">
                            <label for="city">Ciudad</label>
                            <select id="city" name="city" required>
                                <option value="">Selecciona una ciudad</option>
                            </select>
                        </div>

                        <button type="submit" class="btn">Registrar</button>
                    </form>
                </div>
            </div>
            <script>
                // Formatear el RUT mientras el usuario escribe
                document.getElementById('rut').addEventListener('input', function () {
                    let rut = this.value.replace(/\D/g, '');
                    let formattedRut = '';

                    if (rut.length > 1) {
                        formattedRut = rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + rut.slice(-1);
                    } else {
                        formattedRut = rut;
                    }

                    this.value = formattedRut;
                });

                document.getElementById('region').addEventListener('change', function () {
                    const regionId = this.value; // Obtener el ID de la región seleccionada
                    const citySelect = document.getElementById('city'); // Campo de ciudades
                    citySelect.innerHTML = '<option value="">Selecciona una ciudad</option>'; // Limpiar opciones previas

                    if (regionId) {
                        // Hacer una solicitud para obtener las ciudades
                        fetch(`http://25.47.48.69/Proyecto/app/Models/get_cities.php?region_id=${regionId}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`Error en la solicitud: ${response.statusText}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log(data); // Depuración: Verificar la respuesta
                                if (data.length === 0) {
                                    // Si no hay ciudades, mostrar un mensaje
                                    const option = document.createElement('option');
                                    option.textContent = 'No hay ciudades disponibles';
                                    citySelect.appendChild(option);
                                } else {
                                    alert(regionId);
                                    // Agregar las opciones al campo de ciudades
                                    data.forEach(city => {
                                        const option = document.createElement('option');
                                        option.value = city.id;
                                        option.textContent = city.name;
                                        citySelect.appendChild(option);
                                    });
                                }
                            })
                            .catch(error => console.error('Error al cargar ciudades:', error));
                    }
                });
            </script>
        </body>
        </html>
        <?php
    }
}
