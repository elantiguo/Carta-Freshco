# Publicar la Carta Freshco en Render — paso a paso

Guía para publicar la carta con pedidos y panel de administración.
La base de datos está en **Neon** (PostgreSQL) y el servidor en **Render**, ambos en la región
**Ohio (us-east-2)**.

---

## Antes de empezar

Necesitas:

- Acceso a la cuenta de GitHub con el repositorio `elantiguo/Carta-Freshco`.
- Acceso al proyecto en Neon (https://console.neon.tech).
- El archivo `.env.local` en la carpeta del proyecto (lo crea `neon env pull`).
  Contiene la dirección de la base de datos. **No lo compartas ni lo subas a GitHub.**

---

## Paso 1 — Crear la cuenta en Render

1. Entra a https://render.com y pulsa **Get Started**.
2. Regístrate con **GitHub** y autoriza a Render.

## Paso 2 — Crear el servicio desde el Blueprint

1. En https://dashboard.render.com pulsa **New +** (arriba a la derecha) → **Blueprint**.
2. Si no aparece el repositorio, pulsa **Configure account / Connect GitHub** y dale acceso a
   `Carta-Freshco`.
3. Elige **elantiguo/Carta-Freshco** → **Connect**.
4. **Blueprint Name:** `freshco`. **Branch:** `main`.
5. Render lee `render.yaml` y pide dos valores:

   | Variable         | Qué poner |
   |------------------|-----------|
   | `ADMIN_PASSWORD` | Contraseña para entrar al panel. Que sea larga y difícil de adivinar. |
   | `DATABASE_URL`   | Abre `.env.local` y copia el valor de la línea `DATABASE_URL=` **sin las comillas**. Empieza con `postgresql://`. (No uses la de `DATABASE_URL_UNPOOLED`.) |

   `SESSION_SECRET` se genera solo; no hay que tocarlo.
6. Pulsa **Apply** / **Deploy Blueprint**.

## Paso 3 — Esperar el despliegue (3–5 minutos)

1. Entra al servicio **carta-freshco** → pestaña **Logs**.
2. Cuando esté listo verás:

   ```
   Freshco en http://localhost:10000 (almacenamiento: postgres)
   ```

   y el estado **Live** en verde.
3. Si dice `almacenamiento: archivo`, la `DATABASE_URL` está mal o vacía:
   **Environment** → corrígela → **Save Changes**.

## Paso 4 — Probar

La dirección aparece arriba, debajo del nombre del servicio
(normalmente `https://carta-freshco.onrender.com`).

1. **Carta:** desde un celular abre la dirección, agrega productos y pulsa **Enviar pedido**.
2. **Panel:** en el computador de la barra abre `https://<tu-dirección>/admin`
   e inicia sesión con usuario **admin** y la contraseña de `ADMIN_PASSWORD`.
3. El pedido debe aparecer con sus fotos. Haz un clic en el panel para activar el sonido
   de aviso de pedidos nuevos.
4. Guarda `/admin` en favoritos en el computador de la barra.

---

## Uso diario del panel

- Los pedidos se actualizan solos cada 5 segundos y suena un aviso con cada pedido nuevo.
- Botones de cada pedido: **Preparar → Marcar listo → Entregado**, o **Cancelar**.
- Filtros arriba: Activos, Nuevos, Preparando, Listos, Entregados, Cancelados, Todos.
- El cliente ve el estado de su pedido en la página que se le abre al enviarlo.

## Mantenimiento

| Quiero…                              | Cómo |
|--------------------------------------|------|
| Cambiar la contraseña del panel      | Render → servicio → **Environment** → `ADMIN_PASSWORD` → **Save Changes** |
| Cambiar el usuario del panel         | Igual, con `ADMIN_USER` |
| Agregar o cambiar productos          | Editar `js/data.js` y subir el cambio a GitHub (`main`) |
| Publicar cambios                     | Basta con subirlos a `main`; Render vuelve a publicar solo |
| Cambiar la contraseña de la base     | Neon → Branches → production → Roles → `neondb_owner` → **Reset password**; luego `neon env pull` y actualizar `DATABASE_URL` en Render |
| Ver errores                          | Render → servicio → **Logs** |

## Para tener en cuenta

- **Plan gratis de Render:** tras 15 minutos sin visitas el servicio se "duerme" y la primera
  visita tarda unos 30 segundos. Mientras el panel esté abierto en la barra se mantiene despierto.
- **Los pedidos se guardan en Neon**, así que no se pierden aunque Render se reinicie.
- **Nunca** subas `.env.local` a GitHub ni compartas la `DATABASE_URL`: incluye la contraseña
  de la base de datos.

## Solución de problemas

| Problema | Solución |
|----------|----------|
| El despliegue falla con `Falta la variable de entorno ADMIN_PASSWORD` | Agrega `ADMIN_PASSWORD` en **Environment** |
| Logs dicen `almacenamiento: archivo` | Falta o está mal `DATABASE_URL` |
| Logs dicen `No se pudo iniciar el almacenamiento` | La `DATABASE_URL` tiene un error o la contraseña cambió; cópiala de nuevo desde `.env.local` |
| "Usuario o contraseña incorrectos" en el panel | Revisa `ADMIN_USER` / `ADMIN_PASSWORD` en Render |
| "Demasiados intentos" en el panel | Espera 15 minutos |
| No suena el aviso | Haz un clic en el panel y revisa que diga "Sonido: sí" |
