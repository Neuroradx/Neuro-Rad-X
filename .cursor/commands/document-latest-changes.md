Documenta los cambios recientes del proyecto.

**Instrucciones:**

1. Revisa los cambios recientes: diff de git, archivos modificados que el usuario tenga abiertos o mencione, o el estado actual del repositorio.

2. **CHANGELOG:** Actualiza la sección `[Unreleased]` en `CHANGELOG.md`:
   - Sigue el formato [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
   - Usa las categorías ya presentes en el proyecto: Added, Changed, Deprecated, Removed, Fixed, Security.
   - Entradas concisas; mantén el mismo idioma (español o inglés) que el resto del changelog.
   - Agrupa por tipo y ordena de forma coherente.

3. **Documentación:** Si los cambios afectan a seguridad, autenticación o despliegue:
   - Actualiza `docs/security/SECURITY.md` donde corresponda (nuevas rutas, reglas, flujos).
   - Si hace falta una nueva sección o documento en `docs/`, proponla o créala.

4. No inventes cambios; basa las entradas solo en lo que esté modificado o lo que el usuario indique.
