# CRM Fesalud — diseño inicial (sin despliegue)

## Objetivo
Administrar contactos, oportunidades, cotizaciones y seguimiento comercial. Integración futura con WhatsApp Business Platform oficial, sujeta a verificación de elegibilidad, permisos y consentimiento.

## Arquitectura
- Frontend CRM separado del cotizador público; acceso autenticado.
- API Node/Express con rutas /api/crm/* independientes de /api/config y /api/admin/config.
- PostgreSQL, con migraciones versionadas, backups y control de acceso.
- Integración del cotizador mediante API/identificador de cotización; no modificar cálculos ni tarifas de producción.
- WhatsApp Cloud API con webhook verificado, tokens secretos exclusivamente en servidor, y registro de consentimientos.

## Entidades propuestas
- contacts: id, first_name, last_name, phone_e164, birth_date (opcional), source, opt_in_status, created_at.
- opportunities: id, contact_id, stage, owner_id, plan_interest, next_followup_at, created_at.
- quotations: id, opportunity_id, plan_code, inputs_json, calculated_amount, currency, document_ref, created_at.
- activities: id, opportunity_id, kind, note, occurred_at, actor_id.
- messages: id, contact_id, direction, channel, provider_message_id, status, template_id, sent_at.
- users: id, role, password_hash, active.

## Etapas
1. CRM manual: alta/importación validada, deduplicación por teléfono, embudo, notas, agenda.
2. Integración cotizador: cotización asociada al cliente, PDF y estado comercial.
3. WhatsApp: onboarding oficial Meta, webhooks, bandeja, mensajes autorizados y plantillas aprobadas.
4. Asistencia IA opcional: borradores revisados por asesor, no envíos automáticos por defecto.

## Seguridad y cumplimiento
- Sin credenciales ni teléfonos de clientes en el repositorio.
- El acceso administrativo actual por contraseña única no es suficiente para un CRM multiusuario; implementar sesiones, permisos y auditoría.
- Minimización de datos, consentimiento, retención y exportación/eliminación de datos.
- Evitar mensajes de prospección masiva no solicitados; cumplir reglas de Meta.
- Confirmar coexistencia entre app WhatsApp Business y Cloud API antes de vincular el número.
- Mantener producción intacta: nunca desplegar esta rama sobre los servicios actuales sin validación.

## Próximas verificaciones
- Confirmar base de datos y estrategia de migraciones sin exponer secretos.
- Identificar cómo el cotizador genera y comparte cotizaciones.
- Confirmar cuenta Meta Business y disponibilidad de onboarding oficial.
