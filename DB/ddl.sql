DROP DATABASE IF EXISTS cmdbT3;

CREATE DATABASE IF NOT EXISTS cmdbT3;

USE cmdbT3;

-- 1. Catálogo de tipos de CI
CREATE TABLE ci_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);

-- 2. Catálogo de ambientes
CREATE TABLE environments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

-- 3. Items de Configuración (CIs)
CREATE TABLE cis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,                           -- Nombre del CI
  type_id INT NOT NULL,                                  -- FK a ci_types
  description TEXT,                                      -- Descripción
  serial_number VARCHAR(100),                            -- Número de Serie
  version VARCHAR(50),                                   -- Versión
  acquisition_date DATE,                                 -- Fecha de Adquisición
  status ENUM('Activo','Inactivo','Mantenimiento','Retirado') 
         DEFAULT 'Activo',                               -- Estado Actual
  location VARCHAR(100),                                 -- Ubicación Física
  owner VARCHAR(100),                                    -- Propietario/Responsable
  security_level ENUM('Alto','Medio','Bajo') DEFAULT 'Medio',  -- Niveles de Seguridad
  compliance VARCHAR(50),                                -- Cumplimiento
  config_state VARCHAR(50),                              -- Estado de Configuración
  license_number VARCHAR(100),                           -- Número de Licencia
  license_expiration_date DATE,                          -- Fecha de Vencimiento
  documentation_url VARCHAR(255),                        -- Documentación relacionada
  incident_url VARCHAR(255),                             -- Enlaces a Incidentes y Problemas
  environment_id INT,                                    -- FK a environments
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP 
                     ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id)        REFERENCES ci_types(id),
  FOREIGN KEY (environment_id) REFERENCES environments(id)
);

-- 4. Relaciones entre CIs
CREATE TABLE ci_relationships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ci_id INT NOT NULL,            -- CI origen
  related_ci_id INT NOT NULL,    -- CI destino
  relationship_type VARCHAR(50), -- "depende de", "alojado en", "usa"
  FOREIGN KEY (ci_id)         REFERENCES cis(id) ON DELETE CASCADE,
  FOREIGN KEY (related_ci_id) REFERENCES cis(id) ON DELETE CASCADE
);

-- 5. Auditoría cambios
CREATE TABLE ci_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ci_id INT NOT NULL,            -- a qué CI se le hizo el cambio
  change_date DATETIME NOT NULL, -- Fecha de Cambio
  change_description TEXT NOT NULL, -- Descripción del Cambio
  FOREIGN KEY (ci_id) REFERENCES cis(id) ON DELETE CASCADE
);

-- Datos iniciales
INSERT INTO ci_types (name, description) VALUES
  ('Hardware', 'Servidores, routers, switches, etc.'),
  ('Red', 'Dispositivos de red como routers, switches, firewalls'),
  ('Virtualización', 'Plataformas de virtualización como VMware, Hyper-V'),
  ('Almacenamiento', 'Sistemas de almacenamiento y backup'),
  ('Seguridad', 'Dispositivos y software de seguridad'),
  ('Aplicaciones', 'Aplicaciones empresariales y sistemas operativos'),
  ('Servicios en la Nube', 'Servicios y recursos en la nube'),
  ('Documentación', 'Documentación técnica y manuales'),
  ('Licencias', 'Licencias de software y certificaciones'),
  ('Software', 'Aplicaciones y servicios de software'),
  ('Base de Datos', 'Sistemas de gestión de datos');

INSERT INTO environments (name) VALUES
  ('DEV'), ('QA'), ('PROD');


