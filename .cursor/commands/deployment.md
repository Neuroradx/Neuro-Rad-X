Ayuda con el flujo de despliegue del proyecto NeuroradX.

**Flujo actual:**

1. **Despliegue desde local (recomendado):**
   - `npm run deploy` ejecuta `scripts/deploy.sh`: hace git add, commit y push. Si estás en la rama `main`, el deploy a Firebase se ejecuta automáticamente vía GitHub Actions.
   - Alternativa: `npm run deploy:local` hace `npm run build` y luego `firebase deploy` (deploy directo sin pasar por GitHub).

2. **CI/CD:**
   - En push a la rama `main`, GitHub Actions (ver `.github/workflows/`) construye el proyecto y despliega a Firebase Hosting.

**Antes de desplegar, comprobar:**
- Variables de entorno / secretos necesarios en producción: `ADMIN_SERVICE_ACCOUNT`, y opcionalmente `FIREBASE_PROJECT_ID` o `GCLOUD_PROJECT` (si no se usa el valor por defecto).
- En GitHub Actions: el secret `FIREBASE_SERVICE_ACCOUNT_NEURORADX_JOVTO` (o el que use el workflow) debe estar configurado.

**Si el usuario pide ayuda para desplegar:**
- Sugerir los pasos según el caso: build local (`npm run build`), `firebase deploy`, o `npm run deploy` para subir a GitHub y dejar que CI despliegue.
- Referenciar `package.json` (scripts `deploy` y `deploy:local`) y los archivos en `.github/workflows/`.

**Si hay errores de deploy:**
- Ayudar a diagnosticar: fallos de build (Next.js), Firebase CLI no instalado o no autenticado, secrets faltantes en GitHub o en Firebase, y configuración de `firebase.json` / proyecto Firebase.
