# Carta Freshco

Carta digital de Freshco con pedidos en línea y panel de administración.

- **Carta** (`/`): los clientes eligen productos y envían el pedido (en el local por mesa, o a domicilio).
- **Seguimiento** (`/pedido.html?id=…`): el cliente ve su pedido con fotos y el estado en vivo.
- **Panel** (`/admin`): inicio de sesión del personal, lista de pedidos con fotos que se actualiza sola
  cada 5 s, aviso sonoro al llegar un pedido nuevo y botones para cambiar el estado
  (Nuevo → Preparando → Listo → Entregado, o Cancelado).

## Estructura

- `server/index.js`: servidor Express (API + archivos públicos).
- `server/store.js`: guardado de pedidos (PostgreSQL o archivo JSON local).
- `server/auth.js`: inicio de sesión del panel (cookie firmada, límite de intentos).
- `server/carta.js`: lee `js/data.js` para validar productos en el servidor.
- `index.html`, `pedido.html`, `admin.html`, `404.html`: páginas.
- `css/`, `js/`, `img/`: estilos, scripts del navegador e imágenes.

Para agregar o cambiar productos solo edita `js/data.js`; el servidor usa el mismo archivo
(reinícialo después de cambiarlo).

## Ejecutar en local

```bash
npm install
npm start
```

Abre http://localhost:3000 y el panel en http://localhost:3000/admin.
Sin variables de entorno el usuario es `admin` y la contraseña `freshco-dev`, y los pedidos se
guardan en `data/pedidos.json`.

## Variables de entorno

| Variable         | Descripción                                                              |
|------------------|--------------------------------------------------------------------------|
| `ADMIN_USER`     | Usuario del panel (por defecto `admin`).                                 |
| `ADMIN_PASSWORD` | Contraseña del panel. **Obligatoria en producción.**                     |
| `SESSION_SECRET` | Cadena aleatoria para firmar la sesión. **Obligatoria en producción.**   |
| `DATABASE_URL`   | Conexión PostgreSQL. **Recomendada en producción** (ver abajo).          |

## Desplegar en Render

1. Sube el repositorio a GitHub.
2. En [dashboard.render.com](https://dashboard.render.com): **New +** → **Blueprint** → conecta el repositorio.
   Render leerá `render.yaml` y creará un **Web Service** de Node.
3. Cuando lo pida, escribe `ADMIN_PASSWORD` y `DATABASE_URL`. `SESSION_SECRET` se genera solo.

> Si antes tenías la carta como *Static Site*, elimínalo o crea el servicio nuevo con el Blueprint:
> ahora la página necesita un servidor.

### Base de datos (importante)

El disco de Render en el plan gratuito se borra en cada reinicio o despliegue, así que sin
`DATABASE_URL` **se perderían los pedidos**. Crea una base PostgreSQL gratuita en
[Neon](https://neon.tech) o [Supabase](https://supabase.com), copia la cadena de conexión y
ponla en `DATABASE_URL`. La tabla se crea automáticamente al iniciar.

En el plan gratuito, Render también "duerme" el servicio tras 15 minutos sin visitas; la primera
visita después tarda unos segundos en responder.
