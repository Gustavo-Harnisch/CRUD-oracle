<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_horario = $_POST['id_horario'];
    $_SESSION['id_horario'] = $id_horario;
    header('Location: elegirAsiento.php');
    exit();
} else {
    header('Location: indexHorario.php');
    exit();
}
?>