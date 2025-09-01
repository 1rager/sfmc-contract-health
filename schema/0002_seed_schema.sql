-- Migration number: 0002
-- Seed inicial: cria apenas o tenant

INSERT INTO tenants (name, sfmc_subdomain)
VALUES ('Empresa Demo', 'mc12345');