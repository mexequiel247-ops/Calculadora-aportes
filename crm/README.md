# CRM Fesalud — versión local gratuita

Esta carpeta contiene un prototipo sin servicios de pago, no conectado a la API de WhatsApp ni a Render Postgres.

## Uso y límites
- Abrir mediante un servidor estático en entorno de pruebas; no se publicó en producción.
- Los contactos se guardan en localStorage del navegador/dispositivo.
- Exportar regularmente una **copia JSON** desde «Guardar copia de seguridad» y guardarla en un lugar privado; «Restaurar copia» reemplaza los contactos existentes.
- CSV sirve para importar/exportar contactos. Las fechas de seguimiento son avisos dentro de la app, no notificaciones del sistema.
- No existe autenticación ni cifrado de datos en esta versión. **No cargar datos reales de clientes hasta implementar y validar la protección de acceso.**
- Sin sincronización entre dispositivos. El borrado de datos del navegador puede eliminar los contactos.
- Los enlaces WhatsApp abren la aplicación y requieren envío manual. Verificar el número antes de enviar.
- No activar servicios de pago. No desplegar sobre la rama main.

## Siguiente fase
Evaluar cifrado local con Web Crypto y una contraseña de acceso, pruebas de restauración y revisión de seguridad. Un almacenamiento local cifrado no equivale a un servidor sincronizado ni a recuperación automática de contraseña.
