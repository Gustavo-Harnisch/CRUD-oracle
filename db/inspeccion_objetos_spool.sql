SET PAGESIZE 200 LINESIZE 200 TRIMSPOOL ON TAB OFF FEEDBACK ON VERIFY OFF
SPOOL inspeccion_objetos.log
PROMPT === Tablas JRGY* ===
SELECT table_name FROM user_tables WHERE table_name LIKE 'JRGY%' ORDER BY table_name;

PROMPT === Secuencias JRGY* ===
SELECT sequence_name FROM user_sequences WHERE sequence_name LIKE 'SQ_PK_%' ORDER BY sequence_name;

PROMPT === Triggers JRGY* ===
SELECT trigger_name, status FROM user_triggers WHERE trigger_name LIKE 'TRG_%' ORDER BY trigger_name;

PROMPT === Paquetes/Procedimientos/Funciones INVALIDOS ===
SELECT object_name, object_type, status
FROM user_objects
WHERE status <> 'VALID'
  AND object_name LIKE 'JRGY%'
ORDER BY object_type, object_name;

PROMPT === Errores de compilacion ===
SELECT name, type, line, position, text
FROM user_errors
WHERE name LIKE 'JRGY%'
ORDER BY name, sequence;

PROMPT === Tipos JRGY* ===
SELECT type_name, typecode, status
FROM user_types
WHERE type_name LIKE 'DETALLE_%' OR type_name LIKE 'JRGY%'
ORDER BY type_name;

PROMPT === Sinónimos JRGY* (por si acaso) ===
SELECT synonym_name, table_owner, table_name
FROM user_synonyms
WHERE synonym_name LIKE 'JRGY%'
ORDER BY synonym_name;

PROMPT === Fin de inspeccion ===
SPOOL OFF
