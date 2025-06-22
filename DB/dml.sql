
USE cmdbT3;

-- Inserta tipos de CI
INSERT IGNORE INTO ci_types (name, description) VALUES
  ('Hardware', 'Servidores, routers, switches…'),
  ('Software', 'Aplicaciones y servicios de software'),
  ('Base de Datos', 'Sistemas de gestión de datos');

-- Inserta ambientes
INSERT IGNORE INTO environments (name) VALUES
  ('DEV'), ('QA'), ('PROD');

-- Inserta los CIs
INSERT INTO cis (
  name, type_id, description, serial_number, version,
  acquisition_date, status, location, owner,
  documentation_url, incident_url,
  security_level, compliance, config_state,
  license_number, license_expiration_date
)
VALUES
  (
    'Servidor1',
    (SELECT id FROM ci_types   WHERE name = 'Hardware'),
    'Servidor de Aplicaciones',
    'SN123456',
    'v1.0',
    '2022-01-01',
    'Activo',
    'Sala de Servidores 1',
    'Equipo de Infraestructura',
    'www.example.com/docs/servidor1',
    'www.example.com/incidentes/servidor1',
    'Alto',
    'Cumple',
    'Aprobado',
    'ABC123',
    '2023-01-01'
  ),
  (
    'Aplicación',
    (SELECT id FROM ci_types   WHERE name = 'Software'),
    'Aplicación de contabilidad',
    '',            
    'v2.5',
    '2022-03-15',
    'Activo',
    'Servidor1',   
    'Equipo de Desarrollo',
    'www.example.com/docs/aplicacion',
    'www.example.com/incidentes/aplicacion',
    'Medio',
    'Cumple',
    'Aprobado',
    'XYZ456',
    '2024-01-01'
  );

-- Inserta los cambios
INSERT INTO ci_changes (ci_id, change_date, change_description)
VALUES
  (
    (SELECT id FROM cis WHERE name = 'Servidor1'),
    '2022-02-01',
    'Actualización de Software'
  ),
  (
    (SELECT id FROM cis WHERE name = 'Aplicación'),
    '2022-04-01',
    'Parche de Seguridad'
  );

-- Inserta relaciones entre CIs
INSERT INTO ci_relationships (ci_id, related_ci_id, relationship_type)
VALUES
  (
    (SELECT id FROM cis WHERE name = 'Servidor1'),
    (SELECT id FROM cis WHERE name = 'Aplicación'),
    'depende de'
  );

