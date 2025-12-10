PROMPT Semilla demo (departamentos, empleados, servicios, productos) sin acentos. Password: Demo1234
DECLARE
    c_hash CONSTANT VARCHAR2(60) := '$2a$10$294QjQAUurCbQj8NbaTZ7eyPagN2TNIlT2H2CQZY3sLTe/pcss/oO';
    v_estado_activo NUMBER;
    v_estado_lab_activo NUMBER;
    v_role_emp NUMBER;
    v_dummy NUMBER;

    v_tipo_spa NUMBER;
    v_tipo_limp NUMBER;
    v_tipo_tour NUMBER;

    v_dep_recep NUMBER;
    v_dep_mant NUMBER;
    v_dep_limp NUMBER;
    v_dep_serv NUMBER;
    v_dep_seg NUMBER;
    v_dep_cocina NUMBER;

    PROCEDURE ensure_cat_estado_usuario IS
    BEGIN
        SELECT COD_ESTADO_USUARIO INTO v_estado_activo FROM JRGY_CAT_ESTADO_USUARIO WHERE UPPER(ESTADO_USUARIO)='ACTIVO';
    EXCEPTION WHEN NO_DATA_FOUND THEN
        v_estado_activo := 1;
        INSERT INTO JRGY_CAT_ESTADO_USUARIO (COD_ESTADO_USUARIO, ESTADO_USUARIO) VALUES (v_estado_activo, 'ACTIVO');
    END;

    PROCEDURE ensure_cat_estado_laboral IS
    BEGIN
        SELECT COD_ESTADO_LABORAL INTO v_estado_lab_activo FROM JRGY_CAT_ESTADO_LABORAL WHERE UPPER(ESTADO_LABORAL)='ACTIVO';
    EXCEPTION WHEN NO_DATA_FOUND THEN
        v_estado_lab_activo := 1;
        INSERT INTO JRGY_CAT_ESTADO_LABORAL (COD_ESTADO_LABORAL, ESTADO_LABORAL) VALUES (v_estado_lab_activo, 'ACTIVO');
    END;

    PROCEDURE ensure_role_emp IS
    BEGIN
        SELECT COD_ROL INTO v_role_emp FROM JRGY_ROL WHERE UPPER(NOMBRE_ROL)='EMPLOYEE';
    EXCEPTION WHEN NO_DATA_FOUND THEN
        INSERT INTO JRGY_ROL (COD_ROL, NOMBRE_ROL) VALUES (99, 'EMPLOYEE');
        v_role_emp := 99;
    END;

    FUNCTION get_tipo_id(p_nombre VARCHAR2) RETURN NUMBER IS
        v_id NUMBER;
    BEGIN
        SELECT COD_TIPO_SERVICIO INTO v_id FROM JRGY_CAT_TIPO_SERVICIO WHERE UPPER(NOMBRE)=UPPER(p_nombre);
        RETURN v_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN
        RETURN NULL;
    END;

    PROCEDURE ensure_user_role(p_user NUMBER, p_role NUMBER) IS
    BEGIN
        BEGIN
            SELECT 1 INTO v_dummy FROM JRGY_USUARIO_ROL WHERE COD_USUARIO=p_user AND COD_ROL=p_role;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO JRGY_USUARIO_ROL (COD_USUARIO, COD_ROL) VALUES (p_user, p_role);
        END;
    END;

    FUNCTION ensure_user(p_id NUMBER, p_nombre VARCHAR2, p_ap1 VARCHAR2, p_ap2 VARCHAR2, p_mail VARCHAR2) RETURN NUMBER IS
        v_id NUMBER;
    BEGIN
        BEGIN
            SELECT COD_USUARIO INTO v_id FROM JRGY_USUARIO WHERE LOWER(EMAIL_USUARIO)=LOWER(p_mail);
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO JRGY_USUARIO (COD_USUARIO, NOMBRE_USUARIO, APELLIDO1_USUARIO, APELLIDO2_USUARIO, EMAIL_USUARIO, TELEFONO_USUARIO, CONTRASENA_HASH, COD_ESTADO_USUARIO)
            VALUES (p_id, p_nombre, p_ap1, p_ap2, p_mail, 999999999, c_hash, v_estado_activo)
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

    PROCEDURE ensure_emp(p_user NUMBER, p_dep NUMBER, p_cargo VARCHAR2, p_sueldo NUMBER) IS
        v_exists NUMBER;
    BEGIN
        BEGIN
            SELECT COD_EMPLEADO INTO v_exists FROM JRGY_EMPLEADO WHERE COD_USUARIO=p_user;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            INSERT INTO JRGY_EMPLEADO (COD_USUARIO, COD_DEPARTAMENTO, CARGO, SUELDO_BASE, FECHA_CONTRATACION, COD_ESTADO_LABORAL)
            VALUES (p_user, p_dep, p_cargo, p_sueldo, TRUNC(SYSDATE), v_estado_lab_activo);
        END;
    END;

BEGIN
    ensure_cat_estado_usuario;
    ensure_cat_estado_laboral;
    ensure_role_emp;

    v_tipo_spa  := get_tipo_id('SPA');
    v_tipo_limp := get_tipo_id('LIMPIEZA');
    v_tipo_tour := get_tipo_id('TOUR');

    v_dep_recep  := ensure_dep('Recepcion',     15000000);
    v_dep_mant   := ensure_dep('Mantenimiento', 18000000);
    v_dep_limp   := ensure_dep('Limpieza',      12000000);
    v_dep_serv   := ensure_dep('Servicios',     14000000);
    v_dep_seg    := ensure_dep('Seguridad',     13000000);
    v_dep_cocina := ensure_dep('Cocina',        16000000);

    -- Empleados demo
    DECLARE
        CURSOR c_emp IS
            SELECT *
            FROM (
                SELECT 40000001 id, 'Alex' nombre, 'Rivera' ap1, 'Demo' ap2, 'alex.rivera.demo@example.com' email, v_dep_recep dep, 'Recepcionista' cargo, 750000 sueldo FROM dual
                UNION ALL SELECT 40000002, 'Bruno', 'Lopez', 'Demo', 'bruno.lopez.demo@example.com', v_dep_mant, 'Tecnico', 820000 FROM dual
                UNION ALL SELECT 40000003, 'Carla', 'Diaz', 'Demo', 'carla.diaz.demo@example.com', v_dep_limp, 'Operador', 700000 FROM dual
                UNION ALL SELECT 40000004, 'Diego', 'Torres', 'Demo', 'diego.torres.demo@example.com', v_dep_mant, 'Tecnico', 820000 FROM dual
                UNION ALL SELECT 40000005, 'Elena', 'Paz', 'Demo', 'elena.paz.demo@example.com', v_dep_recep, 'Recepcionista', 750000 FROM dual
                UNION ALL SELECT 40000006, 'Felipe', 'Lara', 'Demo', 'felipe.lara.demo@example.com', v_dep_serv, 'Mozo', 680000 FROM dual
                UNION ALL SELECT 40000007, 'Gabriela', 'Moya', 'Demo', 'gabriela.moya.demo@example.com', v_dep_serv, 'Camarera', 680000 FROM dual
                UNION ALL SELECT 40000008, 'Hugo', 'Salas', 'Demo', 'hugo.salas.demo@example.com', v_dep_seg, 'Guardia', 800000 FROM dual
                UNION ALL SELECT 40000009, 'Isabel', 'Campos', 'Demo', 'isabel.campos.demo@example.com', v_dep_limp, 'Operador', 700000 FROM dual
                UNION ALL SELECT 40000010, 'Jorge', 'Fuentes', 'Demo', 'jorge.fuentes.demo@example.com', v_dep_cocina, 'Cocinero', 850000 FROM dual
            );
    BEGIN
        FOR e IN c_emp LOOP
            DECLARE
                v_user NUMBER;
            BEGIN
                v_user := ensure_user(e.id, e.nombre, e.ap1, e.ap2, e.email);
                ensure_user_role(v_user, v_role_emp);
                ensure_emp(v_user, e.dep, e.cargo, e.sueldo);
            END;
        END LOOP;
    END;

    -- Servicios y productos (solo si existen tipos)
    IF v_tipo_spa IS NOT NULL THEN
        ensure_servicio('Spa Relax', 'Acceso spa y sauna', 25000, 'SPA');
        ensure_producto('Toalla Blanca', 'SPA', 5000, 50);
    END IF;

    IF v_tipo_limp IS NOT NULL THEN
        ensure_servicio('Room Clean', 'Limpieza completa', 12000, 'LIMPIEZA');
        ensure_producto('Set Amenity', 'LIMPIEZA', 4000, 80);
    END IF;

    IF v_tipo_tour IS NOT NULL THEN
        ensure_servicio('Exterior Tour', 'Tour guiado exterior', 30000, 'TOUR');
        ensure_producto('Linterna', 'TOUR', 6000, 30);
    END IF;

END;
/
