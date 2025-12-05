<?php
session_start();
session_destroy();
header("Location: Principal.php"); // Redirige a la página principal
exit();
?>