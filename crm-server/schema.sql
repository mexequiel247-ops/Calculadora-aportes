CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS crm_contacts (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 first_name VARCHAR(90) NOT NULL,
 last_name VARCHAR(90) NOT NULL DEFAULT '',
 phone VARCHAR(17) NOT NULL UNIQUE,
 age INTEGER CHECK(age BETWEEN 0 AND 110),
 stage VARCHAR(30) NOT NULL DEFAULT 'Nuevo' CHECK(stage IN ('Nuevo','Interesado','Cotizado','Seguimiento','Afiliado','No interesado')),
 follow_up DATE,
 notes VARCHAR(1500) NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_contacts_follow_up_idx ON crm_contacts(follow_up);
