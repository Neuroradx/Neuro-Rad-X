Revisa el código para detectar duplicados y proponer consolidación.

**Instrucciones:**

1. Revisa el código del proyecto (o el ámbito que el usuario indique) para encontrar:
   - Lógica o código repetido (copy-paste).
   - Helpers o utilidades que hacen lo mismo en distintos archivos.
   - Componentes de UI duplicados o casi idénticos.
   - Constantes o listas definidas en varios sitios (ej. listas de categorías, mensajes de error) que deberían vivir en un único módulo o constante compartida.

2. **Entregable:**
   - Lista de duplicados encontrados con ubicaciones concretas (archivo y, si aplica, función o componente).
   - Propuesta de consolidación: en qué archivo o módulo centralizar y cómo refactorizar (pasos concretos).
   - No apliques los cambios salvo que el usuario lo pida explícitamente.

3. **Ámbito por defecto:** Si el usuario no acota el ámbito, propón revisar primero `src/` (carpetas `actions`, `components`, `lib`, `app`) y ampliar al resto del proyecto si hace falta.
