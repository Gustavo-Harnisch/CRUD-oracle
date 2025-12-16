PROMPT Semilla demo completa (usuarios/empleados, departamentos, regiones/ciudades, servicios, productos)
-- Datos sin acentos.
-- Passwords:
--   * gustavo.admin@example.com    -> Gustavo_make_ALL2004.
--   * gustavo.empleado@example.com -> gustavo_empleado
--   * gustavo.cliente@example.com  -> gustavo_cliente
--   * Resto de cuentas demo        -> Demo1234

DECLARE
    c_hash_demo CONSTANT VARCHAR2(60) := '$2a$10$R4gAes1yY3W08LJi84SX2eHI1y19clorv1PelbHyML4lQxCalWZU6';
    c_hash_admin CONSTANT VARCHAR2(60) := '$2a$10$4PKlqEd.yqxq/sqPK3eyp.8oYpKpstmL3dK1R9X4pNkukuDMMAdu.';
    c_hash_empleado CONSTANT VARCHAR2(60) := '$2a$10$2Pz5XLwrm1waZtBePFgkcuI5AdkfDFaX8tLI33GRbbo8cCdtHv1BG';
    c_hash_cliente CONSTANT VARCHAR2(60) := '$2a$10$wZZfA4QNAE5CDfNlEByJ0eX8geyStz3R6NQzd.7UCrU08JMKjsyxu';

    v_estado_activo        NUMBER;
    v_estado_lab_activo    NUMBER;
    v_role_admin           NUMBER;
    v_role_emp             NUMBER;
    v_role_user            NUMBER;
    v_dummy                NUMBER;

    FUNCTION ensure_estado_usuario RETURN NUMBER IS v_id NUMBER; BEGIN
        SELECT COD_ESTADO_USUARIO INTO v_id FROM JRGY_CAT_ESTADO_USUARIO WHERE UPPER(ESTADO_USUARIO)='ACTIVO';
        RETURN v_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN
        INSERT INTO JRGY_CAT_ESTADO_USUARIO (COD_ESTADO_USUARIO, ESTADO_USUARIO) VALUES (1,'ACTIVO')
        RETURNING COD_ESTADO_USUARIO INTO v_id;
        RETURN v_id;
    END;

    FUNCTION ensure_estado_laboral RETURN NUMBER IS v_id NUMBER; BEGIN
        SELECT COD_ESTADO_LABORAL INTO v_id FROM JRGY_CAT_ESTADO_LABORAL WHERE UPPER(ESTADO_LABORAL)='ACTIVO';
        RETURN v_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN
        INSERT INTO JRGY_CAT_ESTADO_LABORAL (COD_ESTADO_LABORAL, ESTADO_LABORAL) VALUES (1,'ACTIVO')
        RETURNING COD_ESTADO_LABORAL INTO v_id;
        RETURN v_id;
    END;

    FUNCTION ensure_role(p_nombre VARCHAR2, p_id_default NUMBER) RETURN NUMBER IS v_id NUMBER; BEGIN
        SELECT COD_ROL INTO v_id FROM JRGY_ROL WHERE UPPER(NOMBRE_ROL)=UPPER(p_nombre);
        RETURN v_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN
        INSERT INTO JRGY_ROL (COD_ROL, NOMBRE_ROL) VALUES (p_id_default, p_nombre)
        RETURNING COD_ROL INTO v_id;
        RETURN v_id;
    END;

    PROCEDURE ensure_user_role(p_user NUMBER, p_role NUMBER) IS BEGIN
        BEGIN
            SELECT 1 INTO v_dummy FROM JRGY_USUARIO_ROL WHERE COD_USUARIO=p_user AND COD_ROL=p_role;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO JRGY_USUARIO_ROL (COD_USUARIO, COD_ROL) VALUES (p_user, p_role);
        END;
    END;

    PROCEDURE ensure_cliente(p_user NUMBER) IS
    BEGIN
        BEGIN
            SELECT 1 INTO v_dummy FROM JRGY_CLIENTE WHERE COD_USUARIO = p_user;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO JRGY_CLIENTE (COD_USUARIO, FECHA_ALTA)
            VALUES (p_user, TRUNC(SYSDATE));
        END;
    END;

    FUNCTION ensure_user(p_id NUMBER, p_nom VARCHAR2, p_ap1 VARCHAR2, p_ap2 VARCHAR2, p_mail VARCHAR2, p_hash VARCHAR2 DEFAULT c_hash_demo) RETURN NUMBER IS
        v_id NUMBER;
    BEGIN
        BEGIN
            SELECT COD_USUARIO INTO v_id FROM JRGY_USUARIO WHERE LOWER(EMAIL_USUARIO)=LOWER(p_mail);
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO JRGY_USUARIO (COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO, EMAIL_USUARIO, TELEFONO_USUARIO, CONTRASENA_HASH, COD_ESTADO_USUARIO)
            VALUES (p_id, p_nom, p_ap1, p_ap2, p_mail, 999999999, p_hash, v_estado_activo)
            RETURNING COD_USUARIO INTO v_id;
        END;
        RETURN v_id;
    END;

    FUNCTION ensure_dep(p_nombre VARCHAR2, p_presupuesto NUMBER) RETURN NUMBER IS
        v_id NUMBER;
    BEGIN
        BEGIN
            SELECT COD_DEPARTAMENTO INTO v_id FROM JRGY_DEPARTAMENTO WHERE UPPER(NOMBRE)=UPPER(p_nombre);
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO JRGY_DEPARTAMENTO (NOMBRE, PRESUPUESTO) VALUES (p_nombre, p_presupuesto)
            RETURNING COD_DEPARTAMENTO INTO v_id;
        END;
        RETURN v_id;
    END;

    PROCEDURE ensure_empleado(p_user NUMBER, p_dep NUMBER, p_cargo VARCHAR2, p_sueldo NUMBER) IS v_ex NUMBER; BEGIN
        BEGIN
            SELECT COD_EMPLEADO INTO v_ex FROM JRGY_EMPLEADO WHERE COD_USUARIO=p_user;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO JRGY_EMPLEADO (COD_USUARIO, COD_DEPARTAMENTO, CARGO, SUELDO_BASE, FECHA_CONTRATACION, COD_ESTADO_LABORAL)
            VALUES (p_user, p_dep, p_cargo, p_sueldo, TRUNC(SYSDATE), v_estado_lab_activo);
        END;
    END;

    PROCEDURE merge_region(p_id NUMBER, p_nombre VARCHAR2) IS BEGIN
        MERGE INTO JRGY_REGION r USING (SELECT p_id AS id, p_nombre AS nombre FROM dual) d ON (r.COD_REGION=d.id)
        WHEN NOT MATCHED THEN INSERT (COD_REGION, REGION) VALUES (d.id, d.nombre);
    END;

    PROCEDURE merge_ciudad(p_id NUMBER, p_nom VARCHAR2, p_region NUMBER) IS BEGIN
        MERGE INTO JRGY_CIUDAD c USING (SELECT p_id AS id, p_nom AS nom, p_region AS reg FROM dual) d ON (c.COD_CIUDAD=d.id)
        WHEN NOT MATCHED THEN INSERT (COD_CIUDAD, CIUDAD, COD_REGION) VALUES (d.id, d.nom, d.reg);
    END;

    FUNCTION tipo_id(p_nombre VARCHAR2) RETURN NUMBER IS v_id NUMBER; BEGIN
        SELECT COD_TIPO_SERVICIO INTO v_id FROM JRGY_CAT_TIPO_SERVICIO WHERE UPPER(NOMBRE)=UPPER(p_nombre);
        RETURN v_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN RETURN NULL; END;

BEGIN
    v_estado_activo     := ensure_estado_usuario;
    v_estado_lab_activo := ensure_estado_laboral;
    v_role_admin        := ensure_role('ADMIN', 1);
    v_role_emp          := ensure_role('EMPLOYEE', 2);
    v_role_user         := ensure_role('USER', 3);

    -- Regiones y ciudades
    merge_region(10,'MAULE');
    merge_region(11,'OHIGGINS');
    merge_region(12,'NUBLE');
    merge_region(13,'BIOBIO');

    merge_ciudad(100,'TALCA',10);
    merge_ciudad(101,'CURICO',10);
    merge_ciudad(102,'LINARES',10);
    merge_ciudad(103,'CAUQUENES',10);
    merge_ciudad(110,'RANCAGUA',11);
    merge_ciudad(111,'SAN FERNANDO',11);
    merge_ciudad(120,'CHILLAN',12);
    merge_ciudad(121,'SAN CARLOS',12);
    merge_ciudad(130,'CONCEPCION',13);
    merge_ciudad(131,'LOS ANGELES',13);

    -- Departamentos
    DECLARE
        dep_recep   NUMBER := ensure_dep('Recepcion',     15000000);
        dep_mant    NUMBER := ensure_dep('Mantenimiento', 18000000);
        dep_limp    NUMBER := ensure_dep('Limpieza',      12000000);
        dep_serv    NUMBER := ensure_dep('Servicios',     14000000);
        dep_seg     NUMBER := ensure_dep('Seguridad',     13000000);
        dep_cocina  NUMBER := ensure_dep('Cocina',        16000000);
    BEGIN
        NULL; -- placeholders for scope
    END;

    -- Usuarios base gustavo (si no existen)
    DECLARE
        v_id NUMBER;
    BEGIN
        v_id := ensure_user(11111111, 'Gustavo', 'Admin', 'Demo', 'gustavo.admin@example.com', c_hash_admin);
        ensure_user_role(v_id, v_role_admin);
        v_id := ensure_user(22222222, 'Gustavo', 'Empleado', 'Demo', 'gustavo.empleado@example.com', c_hash_empleado);
        ensure_user_role(v_id, v_role_emp);
        ensure_empleado(v_id, NULL, 'Empleado', 850000);
        v_id := ensure_user(33333333, 'Gustavo', 'Cliente', 'Demo', 'gustavo.cliente@example.com', c_hash_cliente);
        ensure_user_role(v_id, v_role_user);
        ensure_cliente(v_id);
    END;

    -- Empleados demo
    DECLARE
        v_user NUMBER;
        dep_recep   NUMBER := ensure_dep('Recepcion',     15000000);
        dep_mant    NUMBER := ensure_dep('Mantenimiento', 18000000);
        dep_limp    NUMBER := ensure_dep('Limpieza',      12000000);
        dep_serv    NUMBER := ensure_dep('Servicios',     14000000);
        dep_seg     NUMBER := ensure_dep('Seguridad',     13000000);
        dep_cocina  NUMBER := ensure_dep('Cocina',        16000000);
    BEGIN
        v_user := ensure_user(40000001,'Alex','Rivera','Demo','alex.rivera.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_recep,'Recepcionista',750000);
        v_user := ensure_user(40000002,'Bruno','Lopez','Demo','bruno.lopez.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_mant,'Tecnico',820000);
        v_user := ensure_user(40000003,'Carla','Diaz','Demo','carla.diaz.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_limp,'Operador',700000);
        v_user := ensure_user(40000004,'Diego','Torres','Demo','diego.torres.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_mant,'Tecnico',820000);
        v_user := ensure_user(40000005,'Elena','Paz','Demo','elena.paz.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_recep,'Recepcionista',750000);
        v_user := ensure_user(40000006,'Felipe','Lara','Demo','felipe.lara.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_serv,'Mozo',680000);
        v_user := ensure_user(40000007,'Gabriela','Moya','Demo','gabriela.moya.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_serv,'Camarera',680000);
        v_user := ensure_user(40000008,'Hugo','Salas','Demo','hugo.salas.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_seg,'Guardia',800000);
        v_user := ensure_user(40000009,'Isabel','Campos','Demo','isabel.campos.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_limp,'Operador',700000);
        v_user := ensure_user(40000010,'Jorge','Fuentes','Demo','jorge.fuentes.demo@example.com'); ensure_user_role(v_user,v_role_emp); ensure_empleado(v_user,dep_cocina,'Cocinero',850000);
    END;

    -- Servicios demo (solo si existe el tipo)
    DECLARE
        tid_spa  NUMBER := tipo_id('SPA');
        tid_lim  NUMBER := tipo_id('LIMPIEZA');
        tid_tour NUMBER := tipo_id('TOUR');
    BEGIN
        IF tid_spa IS NOT NULL THEN
            BEGIN
                SELECT 1 INTO v_dummy FROM JRGY_SERVICIO WHERE UPPER(NOMBRE)='SPA RELAX';
            EXCEPTION WHEN NO_DATA_FOUND THEN
                INSERT INTO JRGY_SERVICIO (NOMBRE, DESCRIPCION, PRECIO, COD_TIPO_SERVICIO, ESTADO, ES_DESTACADO, ORDEN)
                VALUES ('Spa Relax','Acceso spa y sauna',25000,tid_spa,'activo','N',1);
            END;
        END IF;
        IF tid_lim IS NOT NULL THEN
            BEGIN
                SELECT 1 INTO v_dummy FROM JRGY_SERVICIO WHERE UPPER(NOMBRE)='ROOM CLEAN';
            EXCEPTION WHEN NO_DATA_FOUND THEN
                INSERT INTO JRGY_SERVICIO (NOMBRE, DESCRIPCION, PRECIO, COD_TIPO_SERVICIO, ESTADO, ES_DESTACADO, ORDEN)
                VALUES ('Room Clean','Limpieza completa',12000,tid_lim,'activo','N',2);
            END;
        END IF;
        IF tid_tour IS NOT NULL THEN
            BEGIN
                SELECT 1 INTO v_dummy FROM JRGY_SERVICIO WHERE UPPER(NOMBRE)='EXTERIOR TOUR';
            EXCEPTION WHEN NO_DATA_FOUND THEN
                INSERT INTO JRGY_SERVICIO (NOMBRE, DESCRIPCION, PRECIO, COD_TIPO_SERVICIO, ESTADO, ES_DESTACADO, ORDEN)
                VALUES ('Exterior Tour','Tour guiado exterior',30000,tid_tour,'activo','N',3);
            END;
        END IF;
    END;

    -- Productos demo (solo si existe el tipo)
    DECLARE
        tid_spa  NUMBER := tipo_id('SPA');
        tid_lim  NUMBER := tipo_id('LIMPIEZA');
        tid_tour NUMBER := tipo_id('TOUR');
    BEGIN
        IF tid_spa IS NOT NULL THEN
            BEGIN SELECT 1 INTO v_dummy FROM JRGY_PRODUCTO WHERE UPPER(NOMBRE_PRODUCTO)='TOALLA BLANCA'; EXCEPTION WHEN NO_DATA_FOUND THEN
                INSERT INTO JRGY_PRODUCTO (COD_PRODUCTO, NOMBRE_PRODUCTO, COD_TIPO_SERVICIO, PRECIO_PRODUCTO, CANTIDAD_PRODUCTO, STOCK_PRODUCTO)
                VALUES (SQ_PK_PRODUCTO.NEXTVAL, 'Toalla Blanca', tid_spa, 5000, 50, 50);
            END;
        END IF;
        IF tid_lim IS NOT NULL THEN
            BEGIN SELECT 1 INTO v_dummy FROM JRGY_PRODUCTO WHERE UPPER(NOMBRE_PRODUCTO)='SET AMENITY'; EXCEPTION WHEN NO_DATA_FOUND THEN
                INSERT INTO JRGY_PRODUCTO (COD_PRODUCTO, NOMBRE_PRODUCTO, COD_TIPO_SERVICIO, PRECIO_PRODUCTO, CANTIDAD_PRODUCTO, STOCK_PRODUCTO)
                VALUES (SQ_PK_PRODUCTO.NEXTVAL, 'Set Amenity', tid_lim, 4000, 80, 80);
            END;
        END IF;
        IF tid_tour IS NOT NULL THEN
            BEGIN SELECT 1 INTO v_dummy FROM JRGY_PRODUCTO WHERE UPPER(NOMBRE_PRODUCTO)='LINTERNA'; EXCEPTION WHEN NO_DATA_FOUND THEN
                INSERT INTO JRGY_PRODUCTO (COD_PRODUCTO, NOMBRE_PRODUCTO, COD_TIPO_SERVICIO, PRECIO_PRODUCTO, CANTIDAD_PRODUCTO, STOCK_PRODUCTO)
                VALUES (SQ_PK_PRODUCTO.NEXTVAL, 'Linterna', tid_tour, 6000, 30, 30);
            END;
        END IF;
    END;
END;
/
