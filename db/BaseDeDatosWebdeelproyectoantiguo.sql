--Creacion de Tablas

--Tabla MFJCLPBC_Admin
CREATE TABLE MFJCLPBC_Admin (
    rut_admin VARCHAR2(13),
    contrasena_admin VARCHAR2(50),

    CONSTRAINT PK_MFJCLPBC_Admin PRIMARY KEY (rut_admin)
);

-- Tabla MFJCLPBC_Cliente
CREATE TABLE MFJCLPBC_Cliente (
    rut_cliente VARCHAR2(15),
    id_direccion NUMBER,
    nombre_cliente VARCHAR2(100),
    apellidoPaterno_cliente VARCHAR2(100),
    apellidoMaterno_cliente VARCHAR2(100),
    telefono_cliente NUMBER,
    contacto_emergencia VARCHAR2(250),
    contrasena_cliente VARCHAR2(50),

    CONSTRAINT PK_MFJCLPBC_Cliente PRIMARY KEY (rut_cliente),
    CONSTRAINT FK_MFJCLPBC_Cliente FOREIGN KEY (id_direccion) REFERENCES MFJCLPBC_Direccion(id_direccion)
);

-- Tabla MFJCLPBC_Direccion
CREATE TABLE MFJCLPBC_Direccion (
    id_direccion NUMBER,
    id_region NUMBER,
    direccon VARCHAR2(250),

    CONSTRAINT PK_MFJCLPBC_Direccion PRIMARY KEY (id_direccion),
    CONSTRAINT FK_MFJCLPBC_Direccion FOREIGN KEY (id_region) REFERENCES MFJCLPBC_Region(id_region)
);

-- Tabla MFJCLPBC_Region
CREATE TABLE MFJCLPBC_Region (
    id_region NUMBER,
    nombre_region VARCHAR2(100),

    CONSTRAINT PK_MFJCLPBC_Region PRIMARY KEY (id_region)
);

-- Tabla MFJCLPBC_Detalle_Region_Ciudad
CREATE TABLE MFJCLPBC_Detalle_Region_Ciudad (
    id_region NUMBER,
    id_ciudad NUMBER,

    CONSTRAINT PK_MFJCLPBC_Detalle_Region_Ciudad PRIMARY KEY (id_region, id_ciudad),
    CONSTRAINT FK_MFJCLPBC_Detalle_Region_Ciudad FOREIGN KEY (id_region) REFERENCES MFJCLPBC_Region(id_region),
    CONSTRAINT FK_MFJCLPBC_Detalle_Region_Ciudad FOREIGN KEY (id_ciudad) REFERENCES MFJCLPBC_Ciudad(id_ciudad)
);

-- Tabla MFJCLPBC_Ciudad
CREATE TABLE MFJCLPBC_Ciudad (
    id_ciudad NUMBER,
    nombre_ciudad VARCHAR2(100),

    CONSTRAINT PK_MFJCLPBC_Ciudad PRIMARY KEY (id_ciudad)
);

-- Tabla MFJCLPBC_Ticket
CREATE TABLE MFJCLPBC_Ticket (
    id_ticket NUMBER,
    rut_cliente VARCHAR2(15),
    id_horario TIMESTAMP,
    nro_number NUMBER,
    patente_bus VARCHAR2(6),

    CONSTRAINT PK_MFJCLPBC_Ticket PRIMARY KEY (id_ticket),
    CONSTRAINT FK_MFJCLPBC_Ticket FOREIGN KEY (rut_cliente) REFERENCES MFJCLPBC_Cliente(rut_cliente),
    CONSTRAINT FK_MFJCLPBC_Ticket FOREIGN KEY (id_horario) REFERENCES MFJCLPBC_Horario(id_horario)
);

-- Tabla MFJCLPBC_Horario_Bus_Ruta
CREATE TABLE MFJCLPBC_Horario_Bus_Ruta (
    id_horario NUMBER,
    id_bus NUMBER,
    id_ruta NUMBER,

    CONSTRAINT PK_MFJCLPBC_Horario_Bus_Ruta PRIMARY KEY (id_horario, id_bus, id_ruta),
    CONSTRAINT FK_MFJCLPBC_Horario_Bus_Ruta FOREIGN KEY (id_horario) REFERENCES MFJCLPBC_Horario(id_horario),
    CONSTRAINT FK_MFJCLPBC_Horario_Bus_Ruta FOREIGN KEY (id_bus) REFERENCES MFJCLPBC_Bus(id_bus),
    CONSTRAINT FK_MFJCLPBC_Horario_Bus_Ruta FOREIGN KEY (id_ruta) REFERENCES MFJCLPBC_Ruta(id_ruta)
);

-- Tabla MFJCLPBC_Ruta
CREATE TABLE MFJCLPBC_Ruta (
    id_ruta NUMBER,
    origen_ruta VARCHAR2(100),
    destino_ruta VARCHAR2(100),
    distancia_ruta NUMBER,
    duracion_estimada_ruta NUMBER,
    precio_ruta NUMBER,

    CONSTRAINT PK_MFJCLPBC_Ruta PRIMARY KEY (id_ruta)
);

-- Tabla MFJCLPBC_Bus
CREATE TABLE MFJCLPBC_Bus (
    patente_bus VARCHAR2(6),
    modelo_bus VARCHAR2(30),
    capacidad_bus NUMBER,
    año_fabricacion_bus NUMBER,

    CONSTRAINT PK_MFJCLPBC_Bus PRIMARY KEY (id_bus)
);

-- Tabla MFJCLPBC_Asiento
CREATE TABLE MFJCLPBC_Asiento (
    id_asiento NUMBER,
    patente_bus VARCHAR2(6),
    numero_asiento NUMBER,
    estado NUMBER,

    CONSTRAINT PK_MFJCLPBC_Asiento PRIMARY KEY (id_asiento),
    CONSTRAINT FK_MFJCLPBC_Asiento FOREIGN KEY (patente_bus) REFERENCES MFJCLPBC_Bus(patente_bus)
);

-- Tabla MFJCLPBC_Incidente
CREATE TABLE MFJCLPBC_Incidente (
    id_incidente NUMBER,
    patente_bus VARCHAR2(6),
    descripcion_incidente VARCHAR2(2000),
    fecha_incidente DATE,
    gravedad_incidente NUMBER,

    CONSTRAINT PK_MFJCLPBC_Incidente PRIMARY KEY (id_incidente),
    CONSTRAINT FK_MFJCLPBC_Incidente FOREIGN KEY (patente_bus) REFERENCES MFJCLPBC_Bus(patente_bus)
);

-- Tabla MFJCLPBC_Mantenimiento
CREATE TABLE MFJCLPBC_Mantenimiento (
    id_mantenimiento NUMBER,
    patente_bus VARCHAR2(6),
    fecha_mantenimiento DATE,

    CONSTRAINT PK_MFJCLPBC_Mantenimiento PRIMARY KEY (id_mantenimiento),
    CONSTRAINT FK_MFJCLPBC_Mantenimiento FOREIGN KEY (patente_bus) REFERENCES MFJCLPBC_Bus(patente_bus)
);

-- Tabla MFJCLPBC_Detalle_Mantenimiento
CREATE TABLE MFJCLPBC_Detalle_Mantenimiento (
    id_detalle NUMBER,
    id_mantenimiento NUMBER,
    descripcion_mantenimiento VARCHAR2(2000),
    estado_mantenimiento NUMBER,
    costo_mantenimiento NUMBER,

    CONSTRAINT PK_MFJCLPBC_Detalle_Mantenimiento PRIMARY KEY (id_detalle),
    CONSTRAINT FK_MFJCLPBC_Detalle_Mantenimiento FOREIGN KEY (id_mantenimiento) REFERENCES MFJCLPBC_Mantenimiento(id_mantenimiento)
);

-- Procedimientos Almacenados

-- Procedimiento para consultar las ciudades por region
create or replace PROCEDURE Consultar_Ciudades_Por_Region(
    id_region IN NUMBER,
    cur_ciudades OUT SYS_REFCURSOR
)
IS
BEGIN
    OPEN cur_ciudades FOR
    SELECT ID_CIUDAD, NOMBRE_CIUDAD
    FROM MFJCLPBC_CIUDAD
    WHERE ID_REGION = id_region;
END;

-- Procedimiento para consultar el Destino de la Ruta
create or replace PROCEDURE Consultar_Destino_Ruta(
  cur_destino OUT SYS_REFCURSOR
)
IS
BEGIN
  OPEN cur_destino FOR
    SELECT DISTINCT destino_ruta
    FROM MFJCLPBC_RUTA
    ORDER BY destino_ruta;
END;

-- Procedimiento para consultar Horarios
create or replace PROCEDURE Consultar_Horarios (
    p_origen IN VARCHAR2,
    p_destino IN VARCHAR2,
    p_fecha_viaje IN DATE,
    p_cur_horarios OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cur_horarios FOR
    SELECT h.ID_HORARIO, h.PATENTE_BUS, h.ID_RUTA, r.ORIGEN_RUTA, r.DESTINO_RUTA, r.DISTANCIA_RUTA, r.DURACION_ESTIMADA_RUTA, r.PRECIO_RUTA
    FROM MFJCLPBC_HORARIO_BUS_RUTA h
    JOIN MFJCLPBC_RUTA r ON h.ID_RUTA = r.ID_RUTA
    WHERE r.ORIGEN_RUTA = p_origen
      AND r.DESTINO_RUTA = p_destino
      AND TRUNC(h.ID_HORARIO) = TRUNC(p_fecha_viaje);
END;

-- Procedimiento para consultar los asientos por patente de bus
create or replace PROCEDURE Consultar_Id_Asiento(
  p_patente_bus IN VARCHAR2, -- Parámetro de entrada para filtrar por patente de bus
  cur_asiento OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  OPEN cur_asiento FOR
    SELECT 
      a.id_asiento
    FROM MFJCLPBC_ASIENTO a
    WHERE a.patente_bus = p_patente_bus;
END;

-- Procedimiento para consultar el id de la ruta por origen y destino
create or replace NONEDITIONABLE PROCEDURE Consultar_Id_Ruta(
  p_origen IN VARCHAR2, -- Parámetro de entrada para filtrar por origen
  p_destino IN VARCHAR2, -- Parámetro de entrada para filtrar por destino
  cur_ruta OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  OPEN cur_ruta FOR
    SELECT 
      r.id_ruta
    FROM MFJCLPBC_RUTA r
    WHERE r.origen_ruta = p_origen
      AND r.destino_ruta = p_destino;
END;

-- Procedimiento para consultar el origen de la ruta
create or replace PROCEDURE Consultar_Origen_Ruta(
  cur_origen OUT SYS_REFCURSOR
)
IS
BEGIN
  OPEN cur_origen FOR
    SELECT DISTINCT origen_ruta
    FROM MFJCLPBC_RUTA;
END;

-- Procedimiento para consultar las regiones
create or replace PROCEDURE Consultar_Region(
    cur_region OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
    OPEN cur_region FOR
    SELECT 
        id_region, -- Asegúrate de que esta columna exista en la tabla
        nombre_region
    FROM MFJCLPBC_REGION;
END;

-- Procedimiento para consultar las Reseñas
create or replace NONEDITIONABLE PROCEDURE Consultar_Resenas(
    cur_resenas OUT SYS_REFCURSOR
)
IS
BEGIN
    OPEN cur_resenas FOR
    SELECT 
        TO_CHAR(FECHA_RESENA_CLIENTE, 'YYYY-MM-DD') AS "FECHA_RESENA_CLIENTE",
        RUT_CLIENTE AS "RUT_CLIENTE",
        DETALLE_RESENA_CLIENTE AS "DETALLE_RESENA_CLIENTE"
    FROM MFJCLPBC_RESENA_CLIENTE;
END;

-- Procedimiento para crear una nueva reseña
create or replace PROCEDURE CREATE_RESENA(
    p_rut_cliente IN VARCHAR2,
    p_detalle_resena IN VARCHAR2
)
IS
BEGIN
    -- Validar que los datos no sean nulos
    IF p_rut_cliente IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'El RUT del cliente no puede ser nulo.');
    END IF;

    IF p_detalle_resena IS NULL THEN
        RAISE_APPLICATION_ERROR(-20002, 'El detalle de la reseña no puede ser nulo.');
    END IF;

    -- Insertar la nueva reseña (la fecha se genera automáticamente por el trigger)
    INSERT INTO MFJCLPBC_RESENA_CLIENTE (
        RUT_CLIENTE,
        DETALLE_RESENA_CLIENTE
    ) VALUES (
        p_rut_cliente,
        p_detalle_resena
    );

    -- Confirmar cambios
    COMMIT;

    -- Mensaje de éxito (opcional)
    DBMS_OUTPUT.PUT_LINE('Reseña creada exitosamente para el cliente: ' || p_rut_cliente);
EXCEPTION
    WHEN OTHERS THEN
        -- Manejo de errores
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20003, 'Error al crear la reseña: ' || SQLERRM);
END;

-- CRUD para Asientos
create or replace PROCEDURE CRUD_ASIENTO (
  opcion VARCHAR2,
  id_asiento_p NUMBER,
  patente_bus_p VARCHAR2,
  numero_asiento_p NUMBER,
  cur_asientos OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  CASE opcion
    WHEN 'C' THEN
      -- Crear un nuevo asiento
      INSERT INTO MFJCLPBC_ASIENTO (
        id_asiento, 
        patente_bus,
        numero_asiento
      ) VALUES (
        id_asiento_p, 
        patente_bus_p,
        numero_asiento_p
      );

    WHEN 'R' THEN
      -- Leer los datos del asiento específico
      OPEN cur_asientos FOR
        SELECT 
          id_asiento, 
          patente_bus,
          numero_asiento
        FROM MFJCLPBC_ASIENTO
        WHERE id_asiento = id_asiento_p;

    WHEN 'U' THEN
      -- Actualizar los datos del asiento
      UPDATE MFJCLPBC_ASIENTO
      SET 
        patente_bus = patente_bus_p,
        numero_asiento = numero_asiento_p
      WHERE id_asiento = id_asiento_p;

    WHEN 'D' THEN
      -- Eliminar el asiento por ID
      DELETE FROM MFJCLPBC_ASIENTO
      WHERE id_asiento = id_asiento_p;

    ELSE
      -- Manejo de opción inválida
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida. Use C, R, U o D.');
  END CASE;

  -- Confirmar cambios
  COMMIT;
END;

-- CRUD para Buses
create or replace PROCEDURE CRUD_BUS(
  opcion VARCHAR2,
  patente_bus_p VARCHAR2,
  modelo_bus_p VARCHAR2,
  capacidad_bus_p NUMBER,
  año_fabricacion_bus_p NUMBER,
  cur_buses OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  CASE opcion
    WHEN 'C' THEN
      -- Inserción de un nuevo bus
      INSERT INTO MFJCLPBC_BUS(
        patente_bus, 
        modelo_bus, 
        capacidad_bus, 
        año_fabricacion_bus
      ) VALUES (
        patente_bus_p, 
        modelo_bus_p, 
        capacidad_bus_p, 
        año_fabricacion_bus_p
      );
    WHEN 'R' THEN
      -- Consultar información del bus y devolver los datos mediante un cursor
      OPEN cur_buses FOR
        SELECT 
          patente_bus, 
          modelo_bus, 
          capacidad_bus, 
          año_fabricacion_bus
        FROM MFJCLPBC_BUS
        WHERE patente_bus = patente_bus_p;
    WHEN 'U' THEN
      -- Actualizar la información del bus
      UPDATE MFJCLPBC_BUS
      SET 
        modelo_bus = modelo_bus_p, 
        capacidad_bus = capacidad_bus_p, 
        año_fabricacion_bus = año_fabricacion_bus_p
      WHERE patente_bus = patente_bus_p;
    WHEN 'D' THEN
      -- Eliminar un bus
      DELETE FROM MFJCLPBC_BUS
      WHERE patente_bus = patente_bus_p;
    ELSE
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida');
  END CASE;
  COMMIT;
END;

-- CRUD para Clientes
create or replace PROCEDURE CRUD_CLIENTE(
  opcion VARCHAR2,
  rut_cliente_p VARCHAR2,
  id_direccion_p NUMBER DEFAULT NULL,
  nombre_cliente_p VARCHAR2 DEFAULT NULL,
  apellidoPaterno_cliente_p VARCHAR2 DEFAULT NULL,
  apellidoMaterno_cliente_p VARCHAR2 DEFAULT NULL,
  telefono_cliente_p NUMBER DEFAULT NULL,
  contacto_emergencia_p VARCHAR2 DEFAULT NULL,
  contrasena_cliente_p VARCHAR2 DEFAULT NULL,
  cur_clientes OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  CASE opcion
    WHEN 'C' THEN
      -- Validar que los parámetros necesarios no sean nulos
      IF rut_cliente_p IS NULL OR id_direccion_p IS NULL OR nombre_cliente_p IS NULL THEN
        RAISE_APPLICATION_ERROR(-20002, 'Datos insuficientes para crear el cliente.');
      END IF;
      
      INSERT INTO MFJCLPBC_CLIENTE(
        rut_cliente, 
        id_direccion, 
        nombre_cliente, 
        apellidoPaterno_cliente, 
        apellidoMaterno_cliente, 
        telefono_cliente, 
        contacto_emergencia, 
        contrasena_cliente
      ) VALUES (
        rut_cliente_p, 
        id_direccion_p, 
        nombre_cliente_p, 
        apellidoPaterno_cliente_p, 
        apellidoMaterno_cliente_p, 
        telefono_cliente_p, 
        contacto_emergencia_p, 
        contrasena_cliente_p
      );

    WHEN 'R' THEN
      -- Validar que el rut_cliente_p no sea nulo
      IF rut_cliente_p IS NULL THEN
        RAISE_APPLICATION_ERROR(-20003, 'Debe especificar un RUT para leer datos.');
      END IF;

      OPEN cur_clientes FOR
        SELECT 
          rut_cliente, 
          id_direccion, 
          nombre_cliente, 
          apellidoPaterno_cliente, 
          apellidoMaterno_cliente, 
          telefono_cliente, 
          contacto_emergencia, 
          contrasena_cliente
        FROM MFJCLPBC_CLIENTE
        WHERE rut_cliente = rut_cliente_p;

    WHEN 'U' THEN
      -- Validar que el RUT esté presente
      IF rut_cliente_p IS NULL THEN
        RAISE_APPLICATION_ERROR(-20004, 'Debe especificar un RUT para actualizar el cliente.');
      END IF;

      UPDATE MFJCLPBC_CLIENTE
      SET 
        id_direccion = id_direccion_p, 
        nombre_cliente = nombre_cliente_p, 
        apellidoPaterno_cliente = apellidoPaterno_cliente_p, 
        apellidoMaterno_cliente = apellidoMaterno_cliente_p, 
        telefono_cliente = telefono_cliente_p, 
        contacto_emergencia = contacto_emergencia_p, 
        contrasena_cliente = contrasena_cliente_p
      WHERE rut_cliente = rut_cliente_p;

      IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'No se encontró el cliente para actualizar.');
      END IF;

    WHEN 'D' THEN
      -- Validar que el RUT esté presente
      IF rut_cliente_p IS NULL THEN
        RAISE_APPLICATION_ERROR(-20006, 'Debe especificar un RUT para eliminar el cliente.');
      END IF;

      DELETE FROM MFJCLPBC_CLIENTE
      WHERE rut_cliente = rut_cliente_p;

      IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20007, 'No se encontró el cliente para eliminar.');
      END IF;

    ELSE
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida. Use C, R, U o D.');
  END CASE;

  -- Confirmar la transacción
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    -- Registrar el error y revertir la transacción
    ROLLBACK;
    RAISE;
END CRUD_CLIENTE;

-- CRUD para Incidentes
create or replace PROCEDURE CRUD_INCIDENTE(
  opcion VARCHAR2,
  id_incidente_p NUMBER,
  patente_bus_p VARCHAR2,
  descripcion_incidente_p VARCHAR2,
  fecha_incidente_p DATE,
  gravedad_incidente_p NUMBER,
  cur_incidentes OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  CASE opcion
    WHEN 'C' THEN
      INSERT INTO MFJCLPBC_INCIDENTE(
        id_incidente, 
        patente_bus, 
        descripcion_incidente, 
        fecha_incidente, 
        gravedad_incidente
      ) VALUES (
        id_incidente_p, 
        patente_bus_p, 
        descripcion_incidente_p, 
        fecha_incidente_p, 
        gravedad_incidente_p
      );
    WHEN 'R' THEN
      -- Abrimos el cursor para devolver los datos del incidente
      OPEN cur_incidentes FOR
        SELECT 
          id_incidente, 
          patente_bus, 
          descripcion_incidente, 
          fecha_incidente, 
          gravedad_incidente
        FROM MFJCLPBC_INCIDENTE
        WHERE id_incidente = id_incidente_p;
    WHEN 'U' THEN
      UPDATE MFJCLPBC_INCIDENTE
      SET 
        patente_bus = patente_bus_p, 
        descripcion_incidente = descripcion_incidente_p, 
        fecha_incidente = fecha_incidente_p, 
        gravedad_incidente = gravedad_incidente_p
      WHERE id_incidente = id_incidente_p;
    WHEN 'D' THEN
      DELETE FROM MFJCLPBC_INCIDENTE
      WHERE id_incidente = id_incidente_p;
    ELSE
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida');
  END CASE;
  COMMIT;
END;

-- CRUD para Reseñas
create or replace PROCEDURE CRUD_RESENA_CLIENTE (
  opcion VARCHAR2,
  rut_cliente_p NUMBER,
  detalle_resena_cliente_p VARCHAR2,
  cur_resenas OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  CASE opcion
    WHEN 'C' THEN
      -- Crear una nueva reseña
      INSERT INTO MFJCLPBC_RESENA_CLIENTE (
        rut_cliente, 
        detalle_resena_cliente
      ) VALUES (
        rut_cliente_p, 
        detalle_resena_cliente_p
      );

    WHEN 'R' THEN
      -- Leer todas las reseñas de un cliente
      OPEN cur_resenas FOR
        SELECT 
          fecha_resena_cliente, 
          rut_cliente, 
          detalle_resena_cliente
        FROM MFJCLPBC_RESENA_CLIENTE
        WHERE rut_cliente = rut_cliente_p;

    WHEN 'U' THEN
      -- Actualizar una reseña existente
      UPDATE MFJCLPBC_RESENA_CLIENTE
      SET 
        detalle_resena_cliente = detalle_resena_cliente_p
      WHERE rut_cliente = rut_cliente_p;

    WHEN 'D' THEN
      -- Eliminar reseñas de un cliente
      DELETE FROM MFJCLPBC_RESENA_CLIENTE
      WHERE rut_cliente = rut_cliente_p;

    ELSE
      -- Manejo de opción inválida
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida. Use C, R, U o D.');
  END CASE;

  -- Confirmar cambios
  COMMIT;
END;

-- CRUD para Rutas
create or replace PROCEDURE CRUD_RUTA(
  opcion VARCHAR2,
  id_ruta_p NUMBER,
  origen_ruta_p VARCHAR2,
  destino_ruta_p VARCHAR2,
  distancia_ruta_p NUMBER,
  duracion_estimada_ruta_p NUMBER,
  precio_ruta_p NUMBER,
  cur_rutas OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  CASE opcion
    WHEN 'C' THEN
      INSERT INTO MFJCLPBC_RUTA(
        id_ruta, 
        origen_ruta, 
        destino_ruta, 
        distancia_ruta, 
        duracion_estimada_ruta, 
        precio_ruta
      ) VALUES (
        id_ruta_p, 
        origen_ruta_p, 
        destino_ruta_p, 
        distancia_ruta_p, 
        duracion_estimada_ruta_p, 
        precio_ruta_p
      );
    WHEN 'R' THEN
      -- Abrimos el cursor para devolver los datos de la ruta
      OPEN cur_rutas FOR
        SELECT 
          id_ruta, 
          origen_ruta, 
          destino_ruta, 
          distancia_ruta, 
          duracion_estimada_ruta, 
          precio_ruta
        FROM MFJCLPBC_RUTA
        WHERE id_ruta = id_ruta_p;
    WHEN 'U' THEN
      UPDATE MFJCLPBC_RUTA
      SET 
        origen_ruta = origen_ruta_p, 
        destino_ruta = destino_ruta_p, 
        distancia_ruta = distancia_ruta_p, 
        duracion_estimada_ruta = duracion_estimada_ruta_p, 
        precio_ruta = precio_ruta_p
      WHERE id_ruta = id_ruta_p;
    WHEN 'D' THEN
      DELETE FROM MFJCLPBC_RUTA
      WHERE id_ruta = id_ruta_p;
    ELSE
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida');
  END CASE;
  COMMIT;
END;

-- CRUD para Tickets
create or replace PROCEDURE CRUD_TICKET(
  opcion VARCHAR2,
  id_ticket_p NUMBER,
  rut_cliente_p VARCHAR2,
  id_horario_p DATE,
  precio_ticket_p NUMBER,
  id_asiento_p NUMBER,
  patente_bus_p VARCHAR2,
  cur_tickets OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  CASE opcion
    WHEN 'C' THEN
      -- Inserción de un nuevo ticket
      INSERT INTO MFJCLPBC_TICKET(
        id_ticket, 
        rut_cliente,  
        id_horario,
        precio_ticket, 
        id_asiento,
        patente_bus
      ) VALUES (
        id_ticket_p, 
        rut_cliente_p, 
        id_horario_p,
        precio_ticket_p, 
        id_asiento_p,
        patente_bus_p
      );
      
    WHEN 'R' THEN
      -- Consulta de ticket y retorno mediante cursor
      OPEN cur_tickets FOR
        SELECT 
          id_ticket, 
          rut_cliente, 
          id_horario,
          precio_ticket, 
          id_asiento,
          patente_bus
        FROM MFJCLPBC_TICKET
        WHERE id_ticket = id_ticket_p;
      
    WHEN 'U' THEN
      -- Actualización de un ticket
      UPDATE MFJCLPBC_TICKET
      SET 
        rut_cliente = rut_cliente_p, 
        id_horario = id_horario_p,
        precio_ticket = precio_ticket_p, 
        id_asiento = id_asiento_p,
        patente_bus = patente_bus_p
      WHERE id_ticket = id_ticket_p;
      
    WHEN 'D' THEN
      -- Eliminación de un ticket
      DELETE FROM MFJCLPBC_TICKET
      WHERE id_ticket = id_ticket_p;
      
    ELSE
      -- Manejo de opción no válida
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida');
  END CASE;

  -- Confirmar los cambios en caso de operaciones de escritura
  COMMIT;
END;

-- Gestor Incidentes
create or replace PROCEDURE GESTOR_INCIDENTES(
  opcion VARCHAR2,
  id_incidente_p NUMBER,
  patente_bus_p VARCHAR2,
  descripcion_incidente_p VARCHAR2,
  fecha_incidente_p DATE,
  gravedad_incidente_p NUMBER,
  cur_incidentes OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  CASE opcion
    WHEN 'C' THEN
      -- Crear un nuevo incidente
      CRUD_INCIDENTE(
        'C', 
        id_incidente_p, 
        patente_bus_p, 
        descripcion_incidente_p, 
        fecha_incidente_p, 
        gravedad_incidente_p, 
        cur_incidentes
      );
    WHEN 'R' THEN
      -- Leer un incidente existente
      CRUD_INCIDENTE(
        'R', 
        id_incidente_p, 
        NULL, NULL, NULL, NULL, 
        cur_incidentes
      );
    WHEN 'U' THEN
      -- Actualizar un incidente existente
      CRUD_INCIDENTE(
        'U', 
        id_incidente_p, 
        patente_bus_p, 
        descripcion_incidente_p, 
        fecha_incidente_p, 
        gravedad_incidente_p, 
        cur_incidentes
      );
    WHEN 'D' THEN
      -- Borrar un incidente existente
      CRUD_INCIDENTE(
        'D', 
        id_incidente_p, 
        NULL, NULL, NULL, NULL, 
        cur_incidentes
      );
    ELSE
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida');
  END CASE;
END;

-- Gestor Reseñas
create or replace PROCEDURE GESTOR_RESENAS (
  opcion VARCHAR2,
  rut_cliente_p NUMBER,
  detalle_resena_cliente_p VARCHAR2,
  cur_resenas OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
BEGIN
  CASE opcion
    WHEN 'C' THEN
      -- Crear una nueva reseña
      CRUD_RESENA_CLIENTE(
        'C',  
        rut_cliente_p, 
        detalle_resena_cliente_p, 
        cur_resenas
      );

    WHEN 'R' THEN
      -- Leer todas las reseñas de un cliente
      CRUD_RESENA_CLIENTE(
        'R', 
        rut_cliente_p, 
        NULL, 
        cur_resenas
      );

    WHEN 'U' THEN
      -- Actualizar una reseña
      CRUD_RESENA_CLIENTE(
        'U', 
        rut_cliente_p, 
        detalle_resena_cliente_p, 
        cur_resenas
      );

    WHEN 'D' THEN
      -- Eliminar reseñas de un cliente
      CRUD_RESENA_CLIENTE(
        'D', 
        rut_cliente_p, 
        NULL, 
        cur_resenas
      );

    ELSE
      -- Manejo de opción inválida
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida. Use C, R, U o D.');
  END CASE;
END;

-- Gestor Tickets
create or replace PROCEDURE Gestor_Ticket(
  opcion VARCHAR2,
  id_ticket_p NUMBER,
  rut_cliente_p VARCHAR2, -- Ajustado a VARCHAR2 según la tabla BCLPMG_TICKET
  id_horario_p DATE,      -- Agregado id_horario como parte de la tabla BCLPMG_TICKET
  precio_ticket_p NUMBER,
  id_asiento_p NUMBER,
  patente_bus_p VARCHAR2,
  id_ruta_p NUMBER,
  cur_tickets OUT SYS_REFCURSOR -- Parámetro de salida para devolver un cursor
)
IS
  v_precio_ticket NUMBER;
BEGIN
  CASE opcion
    WHEN 'C' THEN
      -- Obtener el precio de la ruta usando la función
      v_precio_ticket := MFJCLPC_Obtener_Precio_Ticket(id_ruta_p);

      -- Usar el CRUD para insertar en BCLPMG_TICKET
      CRUD_TICKET(
        'C',
        id_ticket_p,
        rut_cliente_p,
        id_horario_p,
        v_precio_ticket, -- Usamos el precio obtenido de la función
        id_asiento_p,
        patente_bus_p,
        cur_tickets
      );

    WHEN 'R' THEN
      -- Consultar el ticket y devolver los datos usando el CRUD
      CRUD_TICKET(
        'R',
        id_ticket_p,
        rut_cliente_p,
        id_horario_p,
        precio_ticket_p,
        id_asiento_p,
        patente_bus_p,
        cur_tickets
      );

    WHEN 'U' THEN
      -- Actualizar el ticket principal usando el CRUD
      CRUD_TICKET(
        'U',
        id_ticket_p,
        rut_cliente_p,
        id_horario_p,
        precio_ticket_p,
        id_asiento_p,
        patente_bus_p,
        cur_tickets
      );

    WHEN 'D' THEN
      -- Usar el CRUD para eliminar el ticket principal
      CRUD_TICKET(
        'D',
        id_ticket_p,
        NULL, -- No se necesitan valores adicionales para eliminar
        NULL,
        NULL,
        NULL,
        NULL,
        cur_tickets
      );

    ELSE
      -- Manejo de opción no válida
      RAISE_APPLICATION_ERROR(-20001, 'Opción no válida');
  END CASE;

  -- Confirmar los cambios en caso de operaciones de escritura
  COMMIT;
END;

-- Procedimiento para insertar direcciones
create or replace PROCEDURE INSERTAR_DIRECCION (
  id_region_p NUMBER
)
IS
BEGIN
  -- Insertar el nuevo registro con ID generado automáticamente
  INSERT INTO MFJCLPBC_DIRECCION (
    ID_REGION
  ) VALUES (
    id_region_p
  );

  -- Confirmar los cambios
  COMMIT;
END;

-- Procedimiento para obtener nombres de regiones
create or replace PROCEDURE Obtener_Nombres_Regiones(
    cur_regiones OUT SYS_REFCURSOR
)
IS
BEGIN
    OPEN cur_regiones FOR
    SELECT NOMBRE_REGION
    FROM MFJCLPBC_REGION; -- Asegúrate de que la tabla y columna existen
END;

-- Funcion para obtener el precio del ticket
create or replace FUNCTION MFJCLPC_Obtener_Precio_Ticket(
  p_id_ruta IN NUMBER -- ID de la ruta
)
RETURN NUMBER
IS
  v_precio_ruta NUMBER;
BEGIN
  -- Obtener el precio de la ruta
  SELECT precio_ruta
  INTO v_precio_ruta
  FROM MFJCLPBC_RUTA
  WHERE id_ruta = p_id_ruta;

  RETURN v_precio_ruta;
END;

-- Trigger para que al insertar una reseña se genere la fecha automáticamente
create or replace TRIGGER MFJCLPBC_TRG_ID_RESENA
BEFORE INSERT ON MFJCLPBC_RESENA_CLIENTE
FOR EACH ROW
BEGIN
    :NEW.fecha_resena_cliente := SYSDATE;
END;

-- Trigger para Ocupar Asiento
create or replace TRIGGER OcuparAsiento
AFTER INSERT ON MFJCLPBC_Ticket
FOR EACH ROW
BEGIN
    UPDATE MFJCLPBC_Asiento
    SET estado = 1  -- Asiento ocupado
    WHERE patente_bus = :NEW.patente_bus
      AND id_asiento = :NEW.id_asiento;
END;

-- Trigger para generar el ID de la tabla MFJCLPBC_Detalle_Mantenimiento
create or replace TRIGGER trg_id_detalle
BEFORE INSERT ON MFJCLPBC_Detalle_Mantenimiento
FOR EACH ROW
BEGIN
    -- Asignar el siguiente valor de la secuencia SEQ_ID_DETALLE
    SELECT sq_detalle_mantenimiento.nextval
    INTO :NEW.id_detalle
    FROM DUAL;
END;

-- Trigger para generar el ID de la tabla MFJCLPBC_Direccion
create or replace TRIGGER TRG_ID_DIRECCION 
BEFORE INSERT ON MFJCLPBC_DIRECCION 
FOR EACH ROW
DECLARE
  next_id NUMBER;
BEGIN
  SELECT sq_id_direccion.nextval INTO next_id FROM dual;
  :NEW.id_direccion := next_id;
END;

-- Trigger para generar el ID de la tabla MFJCLPBC_Incidente
create or replace TRIGGER trg_id_incidente
BEFORE INSERT ON MFJCLPBC_Incidente
FOR EACH ROW
BEGIN
    -- Asignar el siguiente valor de la secuencia SEQ_ID_INCIDENTE
    SELECT sq_id_incidente.NEXTVAL
    INTO :NEW.id_incidente
    FROM DUAL;

    -- Asignar la fecha actual si no se especifica
    IF :NEW.fecha_incidente IS NULL THEN
        :NEW.fecha_incidente := SYSDATE;
    END IF;
END;

-- Trigger para generar el ID de la tabla MFJCLPBC_Mantenimiento
create or replace TRIGGER trg_id_mantenimiento
BEFORE INSERT ON MFJCLPBC_Mantenimiento
FOR EACH ROW
BEGIN
    -- Asignar el siguiente valor de la secuencia
    SELECT SQ_ID_MANTENIMIENTO.NEXTVAL
    INTO :NEW.id_mantenimiento
    FROM DUAL;

    -- Asignar la fecha actual automáticamente si no se especifica
    IF :NEW.fecha_mantenimiento IS NULL THEN
        :NEW.fecha_mantenimiento := SYSDATE;
    END IF;
END;

-- Trigger para generar el ID de la tabla MFJCLPBC_Ticket
create or replace TRIGGER TRG_ID_TICKET 
BEFORE INSERT ON MFJCLPBC_TICKET 
FOR EACH ROW
DECLARE
  next_id NUMBER;
BEGIN
  SELECT sq_id_ticket.nextval INTO next_id FROM dual;
  :NEW.id_ticket := next_id;
END;

-- Trigger para validar el RUT del cliente
create or replace TRIGGER TRG_VALIDAR_CLIENTE
BEFORE INSERT OR UPDATE ON MFJCLPBC_CLIENTE
FOR EACH ROW
BEGIN
    IF LENGTH(:NEW.rut_cliente) > 12 THEN
        RAISE_APPLICATION_ERROR(-20001, 'El RUT del cliente debe tener como maximo 12 caracteres.');
    END IF;
END;

-- Trigger para validar la patente del bus
create or replace TRIGGER TRG_VALIDAR_PATENTE_BUS
BEFORE INSERT OR UPDATE ON MFJCLPBC_BUS
FOR EACH ROW
BEGIN
    IF LENGTH(:NEW.patente_bus) > 6 THEN
        RAISE_APPLICATION_ERROR(-20001, 'La patente del bus debe tener como maximo 6 caracteres.');
    END IF;
END;

-- Secuencias

-- Secuencia para la tabla MFJCLPBC_Asiento
CREATE SEQUENCE sq_id_asiento START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 999999999999999 NOCYCLE NOCACHE;

-- Secuencia para la tabla MFJCLPBC_Cliente
CREATE SEQUENCE sq_id_cliente START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 999999999999999 NOCYCLE NOCACHE;

-- Secuencia para la tabla MFJCLPBC_Detalle_Mantenimiento
CREATE SEQUENCE sq_detalle_mantenimiento START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 999999999999999 NOCYCLE NOCACHE;

-- Secuencia para la tabla MFJCLPBC_Direccion
CREATE SEQUENCE sq_id_direccion START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 999999999999999 NOCYCLE NOCACHE;

-- Secuencia para la tabla MFJCLPBC_Incidente
CREATE SEQUENCE sq_id_incidente START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 999999999999999 NOCYCLE NOCACHE;

-- Secuencia para la tabla MFJCLPBC_Mantenimiento
CREATE SEQUENCE sq_id_mantenimiento START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 999999999999999 NOCYCLE NOCACHE;

-- Secuencia para la tabla MFJCLPBC_Ticket
CREATE SEQUENCE sq_id_ticket START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 999999999999999 NOCYCLE NOCACHE;

-- Inserción de datos de prueba

-- Buses
-- Insertar datos en la tabla MFJCLPBC_Bus
INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('AAA001', 'Volvo 9700', 50, 2015);

INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('BBB002', 'Mercedes Benz Travego', 50, 2016);

INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('CCC003', 'Scania K420', 50, 2018);

INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('DDD004', 'Irizar i6', 50, 2020);

INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('EEE005', 'Man Lion''s Coach', 50, 2017);

INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('FFF006', 'Volvo 9900', 50, 2014);

INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('GGG007', 'Mercedes Benz Sprinter', 50, 2015);

INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('HHH008', 'Scania OmniExpress', 50, 2019);

INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('III009', 'Neoplan Skyliner', 50, 2016);

INSERT INTO MFJCLPBC_BUS (patente_bus, modelo_bus, capacidad_bus, año_fabricacion_bus)
VALUES ('JJJ010', 'Volvo B13R', 50, 2021);

-- Ciudades
-- Insertar datos en la tabla MFJCLPBC_CIUDAD
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (71, 14, 'Valdivia');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (72, 14, 'La Unión');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (73, 14, 'Panguipulli');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (74, 14, 'Río Bueno');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (75, 14, 'Lago Ranco');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (76, 14, 'Paillaco');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (77, 14, 'Máfil');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (78, 10, 'Puerto Montt');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (79, 10, 'Castro');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (80, 10, 'Ancud');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (1, 7, 'Talca');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (2, 7, 'Curicó');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (3, 7, 'Linares');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (4, 7, 'Cauquenes');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (5, 7, 'Maule');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (6, 7, 'San Clemente');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (7, 7, 'San Javier');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (8, 7, 'Constitución');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (9, 7, 'Teno');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (10, 7, 'Molina');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (11, 15, 'Arica');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (12, 15, 'Putre');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (13, 15, 'Camarones');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (14, 15, 'General Lagos');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (15, 4, 'La Serena');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (16, 4, 'Coquimbo');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (17, 4, 'Ovalle');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (18, 4, 'Illapel');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (19, 4, 'Vicuña');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (20, 4, 'Monte Patria');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (21, 4, 'Andacollo');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (22, 5, 'Valparaíso');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (23, 5, 'Viña del Mar');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (24, 5, 'Quilpué');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (25, 5, 'Concón');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (26, 5, 'San Antonio');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (27, 5, 'Quillota');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (28, 5, 'La Ligua');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (29, 13, 'Santiago');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (30, 13, 'Maipú');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (31, 13, 'Puente Alto');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (32, 13, 'Las Condes');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (33, 13, 'Providencia');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (34, 13, 'La Florida');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (35, 13, 'Recoleta');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (36, 16, 'Chillán');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (37, 16, 'San Carlos');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (38, 16, 'Bulnes');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (39, 16, 'Quirihue');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (40, 16, 'Coelemu');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (41, 16, 'Yungay');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (42, 8, 'Concepción');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (43, 8, 'Talcahuano');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (44, 8, 'Los Ángeles');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (45, 8, 'Coronel');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (46, 8, 'Lota');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (47, 8, 'Hualpén');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (48, 8, 'San Pedro de la Paz');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (49, 9, 'Temuco');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (50, 9, 'Villarrica');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (51, 9, 'Pucón');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (52, 9, 'Angol');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (53, 9, 'Nueva Imperial');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (54, 9, 'Lautaro');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (55, 9, 'Collipulli');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (56, 14, 'Valdivia');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (57, 14, 'La Unión');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (58, 14, 'Panguipulli');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (59, 14, 'Río Bueno');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (60, 14, 'Lago Ranco');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (61, 14, 'Paillaco');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (62, 14, 'Máfil');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (63, 10, 'Puerto Montt');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (64, 10, 'Castro');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (65, 10, 'Ancud');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (66, 10, 'Osorno');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (67, 10, 'Quellón');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (68, 10, 'Calbuco');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (69, 10, 'Frutillar');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (81, 10, 'Osorno');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (82, 10, 'Quellón');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (83, 10, 'Calbuco');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (84, 10, 'Frutillar');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (85, 12, 'Punta Arenas');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (86, 12, 'Puerto Natales');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (87, 12, 'Porvenir');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (88, 12, 'Puerto Williams');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (89, 11, 'Coyhaique');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (90, 11, 'Puerto Aysén');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (91, 11, 'Chile Chico');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (92, 11, 'Cochrane');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (93, 3, 'Copiapó');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (94, 3, 'Vallenar');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (95, 3, 'Chañaral');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (96, 3, 'Caldera');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (97, 1, 'Iquique');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (98, 1, 'Alto Hospicio');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (99, 1, 'Pozo Almonte');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (100, 1, 'Huara');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (101, 2, 'Antofagasta');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (102, 2, 'Calama');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (103, 2, 'Tocopilla');
INSERT INTO MFJCLPBC_CIUDAD (id_ciudad, id_region, nombre_ciudad) VALUES (104, 2, 'Mejillones');

-- Regiones
-- Insertar datos en la tabla MFJCLPBC_REGION
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (15, 'Región de Arica y Parinacota');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (4, 'Región de Coquimbo');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (5, 'Región de Valparaíso');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (13, 'Región Metropolitana de Santiago');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (16, 'Región de Ñuble');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (8, 'Región del Biobío');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (9, 'Región de La Araucanía');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (14, 'Región de Los Ríos');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (10, 'Región de Los Lagos');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (11, 'Región de Aysén del General Carlos Ibáñez del Campo');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (12, 'Región de Magallanes');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (7, 'Región del Maule');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (3, 'Región de Atacama');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (1, 'Región de Tarapacá');
INSERT INTO MFJCLPBC_REGION (id_region, nombre_region) VALUES (2, 'Región de Antofagasta');

-- Rutas
-- Insertar datos en la tabla MFJCLPBC_RUTA
-- Insertar datos en la tabla MFJCLPBC_RUTA
INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (1, 'Talca', 'Santiago', 250, 3, 10000);

INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (2, 'Santiago', 'Talca', 250, 3, 10000);

INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (3, 'Talca', 'Concepción', 200, 2, 8000);

INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (4, 'Talca', 'Chillán', 150, 1.5, 6000);

INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (5, 'Talca', 'Viña del Mar', 300, 3.5, 12000);

INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (6, 'Talca', 'Valparaíso', 320, 4, 13000);

INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (7, 'Concepción', 'Talca', 200, 2, 8000);

INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (8, 'Chillán', 'Talca', 150, 1.5, 6000);

INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (9, 'Viña del Mar', 'Talca', 300, 3.5, 12000);

INSERT INTO MFJCLPBC_RUTA (id_ruta, origen_ruta, destino_ruta, distancia_ruta, duracion_estimada_ruta, precio_ruta)
VALUES (10, 'Valparaíso', 'Talca', 320, 4, 13000);

-- Admin
-- Insertar datos en la tabla MFJCLPBC_ADMIN
INSERT INTO MFJCLPBC_ADMIN (rut_admin, nombre_admin)
VALUES ('1.111.111-1', 'proyecto');