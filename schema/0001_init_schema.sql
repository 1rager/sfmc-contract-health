-- Migration number: 0001 	 2025-08-20T16:24:39.219Z
-- Tenants (uma instância do seu app por cliente/org SFMC)
CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sfmc_subdomain TEXT NOT NULL, -- ex: mc1234
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Business Units (BUs do SFMC vinculadas ao tenant)
CREATE TABLE IF NOT EXISTS business_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  external_bu_id TEXT, -- MID da BU no SFMC
  name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_bu_tenant ON business_units(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_bu_tenant_mid ON business_units(tenant_id, external_bu_id);

-- Limites contratuais (org-wide ou por BU se precisar override)
CREATE TABLE IF NOT EXISTS org_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bu_id INTEGER NULL REFERENCES business_units(id) ON DELETE CASCADE,
  all_contacts_limit INTEGER,
  email_push_limit INTEGER,
  sms_limit INTEGER,
  whatsapp_limit INTEGER,
  cloudpages_limit INTEGER,
  effective_from TEXT NOT NULL DEFAULT (date('now')),
  effective_to TEXT
);
CREATE INDEX IF NOT EXISTS idx_limits_tenant ON org_limits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_limits_tenant_bu ON org_limits(tenant_id, bu_id);

-- Uso diário (snapshot por dia e por BU quando fizer sentido)  
CREATE TABLE IF NOT EXISTS daily_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bu_id INTEGER NULL REFERENCES business_units(id) ON DELETE SET NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  all_contacts INTEGER,           -- org-wide (deixe bu_id NULL)
  email_push_sent INTEGER,
  sms_sent INTEGER,
  whatsapp_sent INTEGER,
  cloudpages_prints INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (tenant_id, date, bu_id) -- evita duplicar no mesmo dia/BU
);
CREATE INDEX IF NOT EXISTS idx_usage_tenant_date ON daily_usage(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_bu_date ON daily_usage(bu_id, date);

-- Thresholds de alerta (70/85/95 etc.) por canal
CREATE TABLE IF NOT EXISTS thresholds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  percent INTEGER NOT NULL CHECK (percent BETWEEN 1 AND 100),
  channel TEXT NOT NULL CHECK (channel IN ('all_contacts','email_push','sms','whatsapp','cloudpages')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_thresholds_tenant ON thresholds(tenant_id);