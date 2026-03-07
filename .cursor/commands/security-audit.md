Actúa como un Experto en Ciberseguridad especializado en Google Cloud y Firebase.

Realiza una auditoría técnica profunda del proyecto enfocándote en los siguientes vectores de ataque:

**1. Firestore y Storage Rules**
- Analiza los archivos `firestore.rules` y `storage.rules`.
- Busca permisos de escritura/lectura globales, falta de validación de tipos de datos en los `allow write`, y verifica que el acceso esté correctamente vinculado a `request.auth.uid`.

**2. Fuga de Secretos**
- Escanea todo el proyecto en busca de llaves de API, service account JSONs, o tokens de terceros (como OpenAI, Stripe o AWS) que estén hardcodeados en lugar de usar variables de entorno o Secret Manager.

**3. Firebase Auth**
- Revisa la lógica de creación de usuarios y si existen funciones de administración que no verifiquen custom claims (ej. si un usuario normal puede promoverse a admin).

**4. API Routes / Cloud Functions**
- Analiza las rutas en `src/app/api` y las funciones en `.firebase/.../functions` si aplica.
- Busca vulnerabilidades de inyección, falta de validación de inputs y rutas que no verifiquen la autenticación del contexto.

**5. Configuración de Cliente**
- Revisa la inicialización del SDK de Firebase en el frontend (`src/lib/firebase.ts`).
- Comprueba que no se estén exponiendo IDs de proyecto sensibles o que se esté usando el SDK de Admin en el lado del cliente por error.

**Entregable:** Genera un reporte estructurado en una tabla que incluya:
- Vulnerabilidad
- Nivel de Riesgo (Bajo / Medio / Crítico)
- Ubicación del archivo
- Código sugerido para la corrección

**Contexto:** Utiliza la base de código para el análisis. Puedes apoyarte en `docs/security/SECURITY.md` como referencia de la arquitectura de seguridad actual del proyecto.
