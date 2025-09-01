-- Migration number: 0003   2025-09-01
-- Seed dependente (usa tenant_id=1 já criado)

-- Inserir algumas BUs
INSERT INTO business_units (tenant_id, external_bu_id, name)
VALUES
  (1, 'BU-001', 'Marketing Brasil'),
  (1, 'BU-002', 'Marketing LATAM');

-- Limites contratuais
INSERT INTO org_limits (tenant_id, bu_id, all_contacts_limit, email_push_limit, sms_limit, whatsapp_limit, cloudpages_limit, effective_from)
VALUES
  (1, NULL, 200000, 50000000, 15000000, 20000000, 500000, date('now'));

-- Thresholds
INSERT INTO thresholds (tenant_id, percent, channel)
VALUES
  (1, 70, 'all_contacts'),
  (1, 85, 'all_contacts'),
  (1, 95, 'all_contacts'),
  (1, 70, 'email_push'),
  (1, 85, 'email_push'),
  (1, 95, 'email_push'),
  (1, 70, 'sms'),
  (1, 85, 'sms'),
  (1, 95, 'sms'),
  (1, 70, 'whatsapp'),
  (1, 85, 'whatsapp'),
  (1, 95, 'whatsapp'),
  (1, 70, 'cloudpages'),
  (1, 85, 'cloudpages'),
  (1, 95, 'cloudpages');

-- Uso diário
INSERT INTO daily_usage (tenant_id, bu_id, date, all_contacts, email_push_sent, sms_sent, whatsapp_sent, cloudpages_prints)
VALUES
  (1, NULL, date('now','-1 day'), 150000, 1200000, 300000, 500000, 20000),
  (1, NULL, date('now'),         152500, 2000000, 500000, 800000, 35000);