# Carta Freshco

Sitio web estático para la carta digital de Freshco.

## Estructura del Proyecto

- `index.html`: Estructura principal de la página.
- `404.html`: Página de error 404 personalizada.
- `css/`: Estilos modulares (base, header, menu, footer).
- `js/`: Lógica de datos (`data.js`), renderizado SVG (`draw.js`) y navegación (`app.js`).
- `img/`: Logotipos y fotografías de los cócteles.
- `render.yaml`: Manifiesto Blueprint para despliegue automático en Render.

## Pasos para desplegar en Render

### Opción 1: Despliegue con Blueprint (Recomendada)
1. Sube este repositorio a GitHub o GitLab.
2. Ingresa a [dashboard.render.com](https://dashboard.render.com).
3. Haz clic en **New +** y selecciona **Blueprint**.
4. Conecta tu repositorio. Render detectará automáticamente el archivo `render.yaml` y configurará el servicio estático.

### Opción 2: Despliegue manual como Static Site
1. En Render Dashboard, haz clic en **New +** > **Static Site**.
2. Conecta tu repositorio.
3. Configura los siguientes campos:
   - **Name**: `carta-freshco`
   - **Branch**: `main` o `master`
   - **Build Command**: Dejar vacío
   - **Publish Directory**: `.`
4. Haz clic en **Create Static Site**.

